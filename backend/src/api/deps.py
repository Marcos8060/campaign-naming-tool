from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from uuid import UUID
import asyncpg

from src.core.security import verify_token
from src.db.session import get_pool

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    pool: asyncpg.Pool = Depends(get_pool),
):
    payload = verify_token(credentials.credentials)
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = await pool.fetchrow(
        "SELECT id, workspace_id, email, name, role, is_active FROM users WHERE id = $1",
        UUID(user_id)
    )
    if not user or not user["is_active"]:
        raise HTTPException(status_code=401, detail="User not found or inactive")

    return dict(user)


async def get_workspace_id(current_user: dict = Depends(get_current_user)) -> UUID:
    return current_user["workspace_id"]


def require_role(*roles: str):
    def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user["role"] not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return current_user
    return role_checker
