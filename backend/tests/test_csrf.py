"""
Tests for the double-submit-cookie CSRF middleware (src/core/csrf.py).

The rest of the suite runs with csrf_module.enabled = False (see
conftest.py) so ordinary endpoint tests don't need to carry a matching
cookie+header for logic that has nothing to do with CSRF. These tests
re-enable it just for themselves.
"""
from uuid import uuid4

import pytest

from src.core import csrf as csrf_module
from src.core.csrf import CSRF_HEADER_NAME, CSRF_TOKEN_COOKIE

from .conftest import make_user, make_workspace


@pytest.mark.asyncio
class TestCsrfProtection:
    async def _enable(self):
        csrf_module.enabled = True

    def _disable(self):
        csrf_module.enabled = False

    async def test_mutating_request_without_csrf_token_is_rejected(self, client, auth_cookies):
        ac, pool = client
        pool.fetchrow.return_value = make_user(role="admin")
        await self._enable()
        try:
            resp = await ac.delete(f"/api/v1/campaigns/{uuid4()}", cookies=auth_cookies)
            assert resp.status_code == 403
            assert "csrf" in resp.json()["detail"].lower()
        finally:
            self._disable()

    async def test_mutating_request_with_mismatched_csrf_token_is_rejected(self, client, auth_cookies):
        ac, pool = client
        pool.fetchrow.return_value = make_user(role="admin")
        await self._enable()
        try:
            cookies = {**auth_cookies, CSRF_TOKEN_COOKIE: "cookie-value"}
            resp = await ac.delete(
                f"/api/v1/campaigns/{uuid4()}",
                cookies=cookies,
                headers={CSRF_HEADER_NAME: "different-value"},
            )
            assert resp.status_code == 403
        finally:
            self._disable()

    async def test_mutating_request_with_matching_csrf_token_succeeds(self, client, auth_cookies):
        ac, pool = client
        pool.fetchrow.return_value = make_user(role="admin")
        await self._enable()
        try:
            token = "matching-token-value"
            cookies = {**auth_cookies, CSRF_TOKEN_COOKIE: token}
            resp = await ac.delete(
                f"/api/v1/campaigns/{uuid4()}",
                cookies=cookies,
                headers={CSRF_HEADER_NAME: token},
            )
            assert resp.status_code == 200
        finally:
            self._disable()

    async def test_get_requests_are_exempt(self, client, auth_cookies):
        ac, pool = client
        pool.fetchrow.return_value = make_user(role="admin")
        pool.fetchval.return_value = 0
        pool.fetch.return_value = []
        await self._enable()
        try:
            # No csrf_token cookie or header at all — GET should still work.
            resp = await ac.get("/api/v1/campaigns", cookies=auth_cookies)
            assert resp.status_code == 200
        finally:
            self._disable()

    async def test_auth_endpoints_are_exempt(self, client):
        ac, pool = client
        pool.fetchrow.return_value = None  # invalid creds, but that's fine —
        # the point is this shouldn't 403 on a missing CSRF token.
        await self._enable()
        try:
            resp = await ac.post(
                "/api/v1/auth/login",
                json={"email": "nobody@test.com", "password": "irrelevant123"},
            )
            assert resp.status_code == 401  # invalid credentials, not 403 CSRF
        finally:
            self._disable()

    async def test_login_issues_csrf_cookie(self, client):
        ac, pool = client
        user = make_user()
        # login() fetches the user row, then the workspace row, in that order.
        pool.fetchrow.side_effect = [user, make_workspace()]
        resp = await ac.post(
            "/api/v1/auth/login",
            json={"email": user["email"], "password": "TestPass123"},
        )
        assert resp.status_code == 200
        assert CSRF_TOKEN_COOKIE in resp.cookies

        # Readable by JS on purpose — unlike access_token/refresh_token,
        # this Set-Cookie line must NOT carry HttpOnly.
        csrf_set_cookie_lines = [
            line for line in resp.headers.get_list("set-cookie") if line.startswith(f"{CSRF_TOKEN_COOKIE}=")
        ]
        assert len(csrf_set_cookie_lines) == 1
        assert "httponly" not in csrf_set_cookie_lines[0].lower()
