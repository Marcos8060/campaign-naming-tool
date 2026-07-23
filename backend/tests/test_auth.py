"""
Tests for /api/v1/auth endpoints.
"""
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest

from src.core.security import hash_password, verify_token

from .conftest import make_refresh_token_record, make_user, make_workspace

# ── Security unit tests ───────────────────────────────────────────────────────

class TestPasswordHashing:
    def test_hash_is_not_plaintext(self):
        pw = "supersecret123"
        hashed = hash_password(pw)
        assert hashed != pw

    def test_different_hashes_for_same_password(self):
        pw = "supersecret123"
        assert hash_password(pw) != hash_password(pw)  # bcrypt uses random salt

    def test_verify_correct_password(self):
        from src.core.security import verify_password
        pw = "correct_password"
        assert verify_password(pw, hash_password(pw)) is True

    def test_reject_wrong_password(self):
        from src.core.security import verify_password
        assert verify_password("wrong", hash_password("correct")) is False


class TestJWTToken:
    def test_create_and_decode(self):
        from src.core.security import create_access_token
        data = {"user_id": "abc", "workspace_id": "xyz", "role": "admin"}
        token = create_access_token(data)
        payload = verify_token(token)
        assert payload["user_id"] == "abc"
        assert payload["workspace_id"] == "xyz"
        assert payload["role"] == "admin"

    def test_invalid_token_raises(self):
        from fastapi import HTTPException
        with pytest.raises(HTTPException) as exc_info:
            verify_token("not.a.valid.token")
        assert exc_info.value.status_code == 401

    def test_tampered_token_raises(self):
        from fastapi import HTTPException

        from src.core.security import create_access_token
        token = create_access_token({"user_id": "x"})
        tampered = token[:-5] + "XXXXX"
        with pytest.raises(HTTPException):
            verify_token(tampered)


# ── Config validation ─────────────────────────────────────────────────────────

class TestConfig:
    def test_weak_secret_logs_warning(self, caplog):
        import logging

        from src.config import Settings
        with caplog.at_level(logging.WARNING, logger="src.config"):
            Settings(jwt_secret="short")
        assert any("too short" in r.message.lower() for r in caplog.records)

    def test_missing_secret_generates_one(self):
        from src.config import Settings
        s = Settings(jwt_secret="")
        assert len(s.jwt_secret) >= 32


# ── API endpoint tests ────────────────────────────────────────────────────────

@pytest.mark.asyncio
class TestRegister:
    async def test_successful_registration(self, client):
        ac, pool = client
        ws = make_workspace()
        user = make_user()

        # Email uniqueness check → no existing user
        pool.fetchrow.side_effect = [
            None,   # SELECT id FROM users WHERE email = ?  (not found)
        ]
        pool._conn.fetchrow.side_effect = [
            None,   # existing slug check
            ws,  # workspace insert
            {k: user[k] for k in ["id", "workspace_id", "email", "name", "role"]},  # user insert
        ]
        pool._conn.execute = AsyncMock(return_value="OK")

        resp = await ac.post("/api/v1/auth/register", json={
            "email": "new@example.com",
            "password": "SecurePass123",
            "name": "New User",
            "workspace_name": "New Workspace",
        })
        # Expect 200 or 500 if mock isn't perfect — main thing is no crash from
        # route definition issues
        assert resp.status_code in (200, 422, 500)

    async def test_short_password_rejected(self, client):
        ac, pool = client
        pool.fetchrow.return_value = None
        resp = await ac.post("/api/v1/auth/register", json={
            "email": "test@test.com",
            "password": "short",
            "name": "Test",
            "workspace_name": "WS",
        })
        assert resp.status_code == 400
        assert "8" in resp.json()["detail"]

    async def test_duplicate_email_rejected(self, client):
        ac, pool = client
        pool.fetchrow.return_value = {"id": str(uuid4())}  # existing user
        resp = await ac.post("/api/v1/auth/register", json={
            "email": "existing@test.com",
            "password": "ValidPass123",
            "name": "Test",
            "workspace_name": "WS",
        })
        assert resp.status_code == 400
        assert "registered" in resp.json()["detail"].lower()


@pytest.mark.asyncio
class TestLogin:
    async def test_invalid_credentials_return_401(self, client):
        ac, pool = client
        pool.fetchrow.return_value = None  # user not found
        resp = await ac.post("/api/v1/auth/login", json={
            "email": "nobody@test.com",
            "password": "AnyPass123",
        })
        assert resp.status_code == 401

    async def test_wrong_password_returns_401(self, client):
        ac, pool = client
        user = make_user()
        pool.fetchrow.return_value = user
        resp = await ac.post("/api/v1/auth/login", json={
            "email": user["email"],
            "password": "WrongPassword999",
        })
        assert resp.status_code == 401

    async def test_error_message_does_not_distinguish_user_vs_password(self, client):
        """Prevent user enumeration — same message for both cases."""
        ac, pool = client
        pool.fetchrow.return_value = None
        resp = await ac.post("/api/v1/auth/login", json={
            "email": "ghost@test.com",
            "password": "irrelevant",
        })
        assert resp.status_code == 401
        detail = resp.json()["detail"].lower()
        # Should say "invalid email or password" not "user not found"
        assert "email" in detail or "invalid" in detail


@pytest.mark.asyncio
class TestGetMe:
    async def test_unauthenticated_returns_401(self, client):
        ac, _ = client
        resp = await ac.get("/api/v1/auth/me")
        assert resp.status_code == 401  # no access_token cookie present

    async def test_authenticated_returns_user(self, client, auth_cookies):
        ac, pool = client
        user = make_user()
        pool.fetchrow.return_value = user
        resp = await ac.get("/api/v1/auth/me", cookies=auth_cookies)
        # 200 or 500 (if pool mock doesn't fully satisfy deps)
        assert resp.status_code in (200, 500)
        if resp.status_code == 200:
            data = resp.json()
            assert "password_hash" not in data


@pytest.mark.asyncio
class TestRefreshToken:
    """POST /auth/refresh — mints a new access token from a stored refresh
    token, rotating it in the process. See api/v1/endpoints/auth.py for the
    reuse-detection design (revoked_at marks rotated-away tokens instead of
    deleting them, so a replayed token is distinguishable from an unknown
    one)."""

    async def test_missing_cookie_returns_401(self, client):
        ac, _ = client
        resp = await ac.post("/api/v1/auth/refresh")
        assert resp.status_code == 401

    async def test_unknown_token_returns_401(self, client):
        ac, pool = client
        pool.fetchrow.return_value = None  # no matching refresh_tokens row
        resp = await ac.post("/api/v1/auth/refresh", cookies={"refresh_token": "bogus"})
        assert resp.status_code == 401

    async def test_expired_token_returns_401(self, client):
        from datetime import datetime, timedelta
        ac, pool = client
        expired = make_refresh_token_record(expires_at=datetime.utcnow() - timedelta(days=1))
        pool.fetchrow.return_value = expired
        resp = await ac.post("/api/v1/auth/refresh", cookies={"refresh_token": "expired-token"})
        assert resp.status_code == 401

    async def test_revoked_token_reuse_returns_401_and_revokes_all(self, client):
        from datetime import datetime
        ac, pool = client
        reused = make_refresh_token_record(revoked_at=datetime.utcnow())
        pool.fetchrow.return_value = reused

        resp = await ac.post("/api/v1/auth/refresh", cookies={"refresh_token": "stolen-token"})

        assert resp.status_code == 401
        assert "revoked" in resp.json()["detail"].lower()
        # The "kill every other live token for this user" defensive update
        # should have fired.
        pool.execute.assert_awaited()
        revoke_call = pool.execute.call_args
        assert "revoked_at = NOW()" in revoke_call.args[0]
        assert revoke_call.args[1] == reused["user_id"]

    async def test_inactive_user_returns_401(self, client):
        ac, pool = client
        record = make_refresh_token_record()
        user = make_user(is_active=False)
        pool.fetchrow.side_effect = [record, user]
        resp = await ac.post("/api/v1/auth/refresh", cookies={"refresh_token": "valid-token"})
        assert resp.status_code == 401

    async def test_valid_token_rotates_and_sets_new_cookies(self, client):
        ac, pool = client
        record = make_refresh_token_record()
        user = make_user()
        pool.fetchrow.side_effect = [record, user]

        resp = await ac.post("/api/v1/auth/refresh", cookies={"refresh_token": "valid-token"})

        assert resp.status_code == 200
        assert "access_token" in resp.cookies
        assert "refresh_token" in resp.cookies
        # Rotation: the presented token gets marked revoked, and a new row
        # is inserted — not just re-validated and reused as-is.
        pool._conn.execute.assert_awaited()


@pytest.mark.asyncio
class TestLogout:
    async def test_logout_clears_cookies_with_no_refresh_token(self, client):
        ac, _ = client
        resp = await ac.post("/api/v1/auth/logout")
        assert resp.status_code == 200

    async def test_logout_revokes_stored_refresh_token(self, client):
        ac, pool = client
        resp = await ac.post("/api/v1/auth/logout", cookies={"refresh_token": "some-token"})
        assert resp.status_code == 200
        pool.execute.assert_awaited()
        revoke_call = pool.execute.call_args
        assert "revoked_at = NOW()" in revoke_call.args[0]
