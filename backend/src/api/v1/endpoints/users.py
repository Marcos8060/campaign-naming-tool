from fastapi import APIRouter, Depends, HTTPException
from uuid import UUID
import asyncpg

from src.api.deps import get_current_user, get_workspace_id, require_role
from src.db.session import get_pool
from src.core.security import hash_password
from src.core.email import send_invitation_email

router = APIRouter()


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    user = dict(current_user)
    user.pop("password_hash", None)
    return {k: str(v) if isinstance(v, UUID) else v for k, v in user.items()}


@router.get("")
async def list_users(
    workspace_id: UUID = Depends(get_workspace_id),
    pool: asyncpg.Pool = Depends(get_pool),
    current_user: dict = Depends(get_current_user),
):
    users = await pool.fetch(
        """SELECT id, workspace_id, email, name, role, avatar_url, is_active, last_login_at, created_at
           FROM users WHERE workspace_id = $1 AND is_active = true ORDER BY created_at""",
        workspace_id
    )
    return [
        {k: str(v) if isinstance(v, UUID) else v for k, v in dict(u).items()}
        for u in users
    ]


@router.post("/invite")
async def invite_user(
    body: dict,
    current_user: dict = Depends(require_role("admin")),
    pool: asyncpg.Pool = Depends(get_pool),
):
    existing = await pool.fetchrow("SELECT id FROM users WHERE email = $1", body["email"])
    if existing:
        raise HTTPException(status_code=400, detail="A user with this email already exists")

    temp_password = body.get("password", "Camparc2024!")
    invitee_name = body.get("name", body["email"].split("@")[0])

    workspace = await pool.fetchrow(
        "SELECT name FROM workspaces WHERE id = $1", current_user["workspace_id"]
    )
    workspace_name = workspace["name"] if workspace else "your workspace"

    user = await pool.fetchrow(
        """INSERT INTO users (workspace_id, email, password_hash, name, role)
           VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, role, is_active, created_at""",
        current_user["workspace_id"],
        body["email"],
        hash_password(temp_password),
        invitee_name,
        body.get("role", "viewer"),
    )

    await send_invitation_email(
        to_email=body["email"],
        invitee_name=invitee_name,
        workspace_name=workspace_name,
        temp_password=temp_password,
        invited_by=current_user.get("name") or current_user.get("email", "A team admin"),
    )

    return {k: str(v) if isinstance(v, UUID) else v for k, v in dict(user).items()}


@router.patch("/{user_id}/role")
async def change_role(
    user_id: UUID,
    body: dict,
    current_user: dict = Depends(require_role("admin")),
    pool: asyncpg.Pool = Depends(get_pool),
):
    allowed_roles = {"admin", "manager", "viewer"}
    new_role = body.get("role")
    if new_role not in allowed_roles:
        raise HTTPException(status_code=400, detail="Invalid role")
    if str(user_id) == str(current_user["id"]):
        raise HTTPException(status_code=400, detail="Cannot change your own role")

    user = await pool.fetchrow(
        "UPDATE users SET role = $1 WHERE id = $2 AND workspace_id = $3 RETURNING id, email, name, role",
        new_role, user_id, current_user["workspace_id"]
    )
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {k: str(v) if isinstance(v, UUID) else v for k, v in dict(user).items()}


@router.delete("/{user_id}")
async def remove_user(
    user_id: UUID,
    current_user: dict = Depends(require_role("admin")),
    pool: asyncpg.Pool = Depends(get_pool),
):
    if str(user_id) == str(current_user["id"]):
        raise HTTPException(status_code=400, detail="Cannot remove yourself")
    await pool.execute(
        "UPDATE users SET is_active = false WHERE id = $1 AND workspace_id = $2",
        user_id, current_user["workspace_id"]
    )
    return {"success": True}
