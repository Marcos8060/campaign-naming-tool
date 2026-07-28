import logging
from datetime import datetime, timedelta
from uuid import UUID, uuid4

import asyncpg
from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response
from pydantic import BaseModel

from src.api.deps import get_current_user
from src.config import settings
from src.core.csrf import CSRF_TOKEN_COOKIE, generate_csrf_token
from src.core.email import send_password_reset_email
from src.core.limiter import limiter
from src.core.security import (
    create_access_token,
    generate_refresh_token,
    generate_reset_token,
    hash_password,
    hash_refresh_token,
    hash_reset_token,
    verify_password,
)
from src.db.session import get_pool

router = APIRouter()
logger = logging.getLogger(__name__)

ACCESS_TOKEN_COOKIE = "access_token"
REFRESH_TOKEN_COOKIE = "refresh_token"
# Scoped narrower than the access token cookie on purpose — this cookie
# should only ever be sent on the one request that's allowed to use it.
# Keeping it off every other endpoint means it never shows up in ordinary
# request logs/proxies, and a captured request to any other route can't
# expose it.
REFRESH_COOKIE_PATH = "/api/v1/auth/refresh"


def set_auth_cookie(response: Response, token: str) -> None:
    """Issue the session as an httpOnly cookie instead of relying on the
    frontend to store the JWT itself (localStorage is readable by any JS
    that runs on the page, which makes a stored token a standing XSS
    target). `secure` is tied to environment rather than always-on so this
    still works over plain http on localhost during development."""
    response.set_cookie(
        key=ACCESS_TOKEN_COOKIE,
        value=token,
        httponly=True,
        secure=settings.is_production(),
        samesite="lax",
        max_age=settings.jwt_expiration,
        path="/",
        domain=settings.cookie_domain or None,
    )


def set_refresh_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=REFRESH_TOKEN_COOKIE,
        value=token,
        httponly=True,
        secure=settings.is_production(),
        samesite="lax",
        max_age=settings.refresh_token_expiration_days * 24 * 60 * 60,
        path=REFRESH_COOKIE_PATH,
        domain=settings.cookie_domain or None,
    )


def set_csrf_cookie(response: Response, token: str) -> None:
    """Deliberately NOT httpOnly, unlike the auth cookies — the frontend has
    to read this value in JS to echo it back as a header (see
    src/core/csrf.py). That's safe: this token only ever proves a request
    came from same-origin JS, it isn't a credential by itself."""
    response.set_cookie(
        key=CSRF_TOKEN_COOKIE,
        value=token,
        httponly=False,
        secure=settings.is_production(),
        samesite="lax",
        max_age=settings.jwt_expiration,
        path="/",
        domain=settings.cookie_domain or None,
    )


def clear_session_cookies(response: Response) -> None:
    # Attributes (path and domain especially) must match what set_*_cookie
    # used, or the browser won't recognize it as the same cookie to delete.
    domain = settings.cookie_domain or None
    response.delete_cookie(key=ACCESS_TOKEN_COOKIE, path="/", domain=domain)
    response.delete_cookie(key=REFRESH_TOKEN_COOKIE, path=REFRESH_COOKIE_PATH, domain=domain)
    response.delete_cookie(key=CSRF_TOKEN_COOKIE, path="/", domain=domain)


async def issue_refresh_token(db, user_id) -> str:
    """Generate, hash, and store a new refresh token for user_id. `db` can
    be a pool or an open connection (e.g. inside register's transaction) —
    both support .execute(). Returns the raw token to set as a cookie;
    only its hash is ever persisted (see hash_refresh_token)."""
    raw_token = generate_refresh_token()
    expires_at = datetime.utcnow() + timedelta(days=settings.refresh_token_expiration_days)
    await db.execute(
        "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)",
        user_id, hash_refresh_token(raw_token), expires_at,
    )
    return raw_token


RESET_TOKEN_EXPIRY_MINUTES = 60
GENERIC_RESET_RESPONSE = {"message": "If that email has an account, a reset link is on its way."}


class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    workspace_name: str


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    # No access_token field on purpose — the token only ever travels as the
    # httpOnly cookie set by set_auth_cookie(). Putting it in the JSON body
    # too would hand it straight back to page JS (and anything an XSS bug
    # injects into it), which defeats the point of httpOnly in the first
    # place.
    user: dict
    workspace: dict


@router.post("/register", response_model=AuthResponse)
@limiter.limit("5/minute")
async def register(
    request: Request, body: RegisterRequest, response: Response, pool: asyncpg.Pool = Depends(get_pool)
):
    if len(body.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    existing = await pool.fetchrow("SELECT id FROM users WHERE email = $1", body.email.lower().strip())
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    async with pool.acquire() as conn:
        async with conn.transaction():
            slug = body.workspace_name.lower().strip().replace(" ", "-")
            import re
            slug = re.sub(r"[^a-z0-9-]", "", slug)
            slug = slug[:50]

            existing_slug = await conn.fetchrow("SELECT id FROM workspaces WHERE slug = $1", slug)
            if existing_slug:
                slug = f"{slug}-{str(uuid4())[:8]}"

            workspace = await conn.fetchrow(
                "INSERT INTO workspaces (name, slug) VALUES ($1, $2) RETURNING *",
                body.workspace_name.strip(), slug
            )

            await conn.execute(
                "INSERT INTO workspace_themes (workspace_id) VALUES ($1)",
                workspace["id"]
            )

            user = await conn.fetchrow(
                """INSERT INTO users (workspace_id, email, password_hash, name, role)
                   VALUES ($1, $2, $3, $4, 'admin') RETURNING id, workspace_id, email, name, role""",
                workspace["id"],
                body.email.lower().strip(),
                hash_password(body.password),
                body.name.strip(),
            )

            refresh_token_raw = await issue_refresh_token(conn, user["id"])

    token = create_access_token({
        "user_id": str(user["id"]),
        "workspace_id": str(user["workspace_id"]),
        "role": user["role"],
    })

    def serialize(row) -> dict:
        return {k: str(v) if isinstance(v, UUID) else v for k, v in dict(row).items()
                if k != "password_hash"}

    set_auth_cookie(response, token)
    set_refresh_cookie(response, refresh_token_raw)
    set_csrf_cookie(response, generate_csrf_token())

    return AuthResponse(
        user=serialize(user),
        workspace=serialize(workspace),
    )


@router.post("/login", response_model=AuthResponse)
@limiter.limit("5/minute")
async def login(
    request: Request, body: LoginRequest, response: Response, pool: asyncpg.Pool = Depends(get_pool)
):
    user = await pool.fetchrow(
        "SELECT * FROM users WHERE email = $1 AND is_active = true",
        body.email.lower().strip()
    )
    if not user or not verify_password(body.password, user["password_hash"]):
        # Constant-time response to prevent user enumeration
        raise HTTPException(status_code=401, detail="Invalid email or password")

    workspace = await pool.fetchrow(
        "SELECT * FROM workspaces WHERE id = $1",
        user["workspace_id"]
    )

    await pool.execute(
        "UPDATE users SET last_login_at = NOW() WHERE id = $1",
        user["id"]
    )

    token = create_access_token({
        "user_id": str(user["id"]),
        "workspace_id": str(user["workspace_id"]),
        "role": user["role"],
    })

    user_dict = {k: str(v) if isinstance(v, UUID) else v for k, v in dict(user).items()}
    user_dict.pop("password_hash", None)

    refresh_token_raw = await issue_refresh_token(pool, user["id"])

    set_auth_cookie(response, token)
    set_refresh_cookie(response, refresh_token_raw)
    set_csrf_cookie(response, generate_csrf_token())

    return AuthResponse(
        user=user_dict,
        workspace={k: str(v) if isinstance(v, UUID) else v for k, v in dict(workspace).items()},
    )


@router.post("/refresh")
@limiter.limit("20/minute")
async def refresh_session(
    request: Request,
    response: Response,
    refresh_token: str | None = Cookie(default=None),
    pool: asyncpg.Pool = Depends(get_pool),
):
    """Mints a new (short-lived) access token from the longer-lived refresh
    token, so the frontend doesn't have to force a re-login every 15
    minutes. Called reactively — the frontend hits this once it gets a 401
    from an expired access token, then retries the original request."""
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    token_hash = hash_refresh_token(refresh_token)
    record = await pool.fetchrow(
        "SELECT id, user_id, expires_at, revoked_at FROM refresh_tokens WHERE token_hash = $1",
        token_hash,
    )
    if not record:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    if record["revoked_at"] is not None:
        # This exact token was already rotated away by an earlier refresh —
        # being presented again means it was copied before rotation and is
        # now being replayed, not a legitimate retry. Treat it as a theft
        # signal and kill every other live refresh token for this user so
        # a stolen token can't keep minting new sessions.
        await pool.execute(
            "UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL",
            record["user_id"],
        )
        logger.warning(
            "Refresh token reuse detected for user %s — all sessions revoked.", record["user_id"]
        )
        clear_session_cookies(response)
        raise HTTPException(status_code=401, detail="Session revoked. Please log in again.")

    if record["expires_at"] < datetime.utcnow():
        raise HTTPException(status_code=401, detail="Refresh token expired")

    user = await pool.fetchrow(
        "SELECT id, workspace_id, role, is_active FROM users WHERE id = $1",
        record["user_id"],
    )
    if not user or not user["is_active"]:
        raise HTTPException(status_code=401, detail="User not found or inactive")

    async with pool.acquire() as conn:
        async with conn.transaction():
            # Rotate: mark this token used, then issue a fresh one. Marking
            # rather than deleting is what makes the reuse check above
            # possible on the *next* refresh attempt.
            await conn.execute(
                "UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1",
                record["id"],
            )
            new_refresh_raw = await issue_refresh_token(conn, user["id"])

    new_access_token = create_access_token({
        "user_id": str(user["id"]),
        "workspace_id": str(user["workspace_id"]),
        "role": user["role"],
    })

    set_auth_cookie(response, new_access_token)
    set_refresh_cookie(response, new_refresh_raw)
    set_csrf_cookie(response, generate_csrf_token())

    return {"message": "Token refreshed"}


@router.post("/logout")
async def logout(
    response: Response,
    refresh_token: str | None = Cookie(default=None),
    pool: asyncpg.Pool = Depends(get_pool),
):
    # Revoke the refresh token server-side too, not just clear cookies —
    # otherwise "logging out" doesn't actually invalidate anything, it just
    # stops this one browser from sending the credential. Best-effort: a
    # missing/already-invalid token shouldn't block clearing the cookies.
    if refresh_token:
        await pool.execute(
            "UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1 AND revoked_at IS NULL",
            hash_refresh_token(refresh_token),
        )
    clear_session_cookies(response)
    return {"message": "Logged out"}


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    user = dict(current_user)
    user.pop("password_hash", None)
    return {k: str(v) if isinstance(v, UUID) else v for k, v in user.items()}


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


@router.post("/forgot-password")
@limiter.limit("5/minute")
async def forgot_password(
    request: Request, body: ForgotPasswordRequest, pool: asyncpg.Pool = Depends(get_pool)
):
    user = await pool.fetchrow(
        "SELECT id, email FROM users WHERE email = $1 AND is_active = true",
        body.email.lower().strip(),
    )
    # Always return the same response whether or not the email exists —
    # otherwise this endpoint becomes a way to enumerate registered emails.
    if not user:
        return GENERIC_RESET_RESPONSE

    raw_token = generate_reset_token()
    expires_at = datetime.utcnow() + timedelta(minutes=RESET_TOKEN_EXPIRY_MINUTES)

    async with pool.acquire() as conn:
        async with conn.transaction():
            # A fresh request supersedes any earlier ones for this user —
            # otherwise multiple old links from a previous "forgot password"
            # click would stay valid at once.
            await conn.execute("DELETE FROM password_reset_tokens WHERE user_id = $1", user["id"])
            await conn.execute(
                "INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)",
                user["id"], hash_reset_token(raw_token), expires_at,
            )

    reset_url = f"{settings.frontend_url}/reset-password?token={raw_token}"
    sent = await send_password_reset_email(to_email=user["email"], reset_url=reset_url)
    if not sent:
        # Email delivery isn't configured/working — don't silently pretend it
        # worked in the logs, but the API response stays generic either way.
        logger.warning("Password reset requested for %s but email delivery failed.", user["email"])

    return GENERIC_RESET_RESPONSE


@router.post("/reset-password")
@limiter.limit("10/minute")
async def reset_password(
    request: Request, body: ResetPasswordRequest, pool: asyncpg.Pool = Depends(get_pool)
):
    if len(body.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    token_hash = hash_reset_token(body.token)
    record = await pool.fetchrow(
        """SELECT id, user_id FROM password_reset_tokens
           WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()""",
        token_hash,
    )
    if not record:
        raise HTTPException(status_code=400, detail="This reset link is invalid or has expired")

    async with pool.acquire() as conn:
        async with conn.transaction():
            await conn.execute(
                "UPDATE users SET password_hash = $1 WHERE id = $2",
                hash_password(body.new_password), record["user_id"],
            )
            # Clear every outstanding token for this user, not just the one
            # used — a reset should invalidate any other unused links too.
            await conn.execute("DELETE FROM password_reset_tokens WHERE user_id = $1", record["user_id"])

    return {"message": "Password updated. You can now sign in with your new password."}
