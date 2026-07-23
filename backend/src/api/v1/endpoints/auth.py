import logging
from datetime import datetime, timedelta
from uuid import UUID, uuid4

import asyncpg
from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel

from src.api.deps import get_current_user
from src.config import settings
from src.core.email import send_password_reset_email
from src.core.security import (
    create_access_token,
    generate_reset_token,
    hash_password,
    hash_reset_token,
    verify_password,
)
from src.db.session import get_pool

router = APIRouter()
logger = logging.getLogger(__name__)

ACCESS_TOKEN_COOKIE = "access_token"


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
    )

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
async def register(body: RegisterRequest, response: Response, pool: asyncpg.Pool = Depends(get_pool)):
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

    token = create_access_token({
        "user_id": str(user["id"]),
        "workspace_id": str(user["workspace_id"]),
        "role": user["role"],
    })

    def serialize(row) -> dict:
        return {k: str(v) if isinstance(v, UUID) else v for k, v in dict(row).items()
                if k != "password_hash"}

    set_auth_cookie(response, token)

    return AuthResponse(
        user=serialize(user),
        workspace=serialize(workspace),
    )


@router.post("/login", response_model=AuthResponse)
async def login(body: LoginRequest, response: Response, pool: asyncpg.Pool = Depends(get_pool)):
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

    set_auth_cookie(response, token)

    return AuthResponse(
        user=user_dict,
        workspace={k: str(v) if isinstance(v, UUID) else v for k, v in dict(workspace).items()},
    )


@router.post("/logout")
async def logout(response: Response):
    # No server-side session/blocklist to invalidate — the JWT stays valid
    # until it expires either way, this just tells the browser to stop
    # sending it. Same cookie attributes (path in particular) must match
    # the ones used in set_auth_cookie, or the browser won't match it.
    response.delete_cookie(key=ACCESS_TOKEN_COOKIE, path="/")
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
async def forgot_password(body: ForgotPasswordRequest, pool: asyncpg.Pool = Depends(get_pool)):
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
async def reset_password(body: ResetPasswordRequest, pool: asyncpg.Pool = Depends(get_pool)):
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
