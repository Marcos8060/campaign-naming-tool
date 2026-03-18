from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from uuid import UUID, uuid4
import asyncpg

from src.core.security import hash_password, verify_password, create_access_token
from src.db.session import get_pool
from src.api.deps import get_current_user

router = APIRouter()


class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    workspace_name: str


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict
    workspace: dict


@router.post("/register", response_model=AuthResponse)
async def register(body: RegisterRequest, pool: asyncpg.Pool = Depends(get_pool)):
    if len(body.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    existing = await pool.fetchrow("SELECT id FROM users WHERE email = $1", body.email.lower().strip())
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    async with pool.acquire() as conn:
        async with conn.transaction():
            slug = body.workspace_name.lower().strip().replace(" ", "-")
            # Remove non-alphanumeric except hyphens
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

    return AuthResponse(
        access_token=token,
        user=serialize(user),
        workspace=serialize(workspace),
    )


@router.post("/login", response_model=AuthResponse)
async def login(body: LoginRequest, pool: asyncpg.Pool = Depends(get_pool)):
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

    return AuthResponse(
        access_token=token,
        user=user_dict,
        workspace={k: str(v) if isinstance(v, UUID) else v for k, v in dict(workspace).items()},
    )


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    user = dict(current_user)
    user.pop("password_hash", None)
    return {k: str(v) if isinstance(v, UUID) else v for k, v in user.items()}
