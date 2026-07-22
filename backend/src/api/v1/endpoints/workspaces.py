from uuid import UUID

import asyncpg
from fastapi import APIRouter, Depends, HTTPException

from src.api.deps import get_workspace_id, require_role
from src.db.session import get_pool

router = APIRouter()


@router.get("/current")
async def get_current_workspace(
    workspace_id: UUID = Depends(get_workspace_id),
    pool: asyncpg.Pool = Depends(get_pool),
):
    workspace = await pool.fetchrow(
        """SELECT w.*, wt.primary_color, wt.secondary_color, wt.accent_color,
                  wt.logo_url, wt.logo_dark_url, wt.favicon_url,
                  wt.background_primary, wt.text_primary, wt.border_color,
                  wt.danger_color, wt.warning_color, wt.success_color,
                  wt.primary_hover, wt.background_secondary, wt.text_secondary
           FROM workspaces w
           LEFT JOIN workspace_themes wt ON wt.workspace_id = w.id
           WHERE w.id = $1""",
        workspace_id
    )
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return {k: str(v) if isinstance(v, UUID) else v for k, v in dict(workspace).items()}


@router.patch("/current")
async def update_workspace(
    body: dict,
    current_user: dict = Depends(require_role("admin")),
    pool: asyncpg.Pool = Depends(get_pool),
):
    workspace_id = current_user["workspace_id"]
    allowed = {"name", "settings"}
    updates = {k: v for k, v in body.items() if k in allowed}
    if not updates:
        raise HTTPException(status_code=400, detail="No valid fields to update")

    set_clause = ", ".join([f"{k} = ${i+2}" for i, k in enumerate(updates.keys())])
    values = list(updates.values())

    workspace = await pool.fetchrow(
        f"UPDATE workspaces SET {set_clause}, updated_at = NOW() WHERE id = $1 RETURNING *",
        workspace_id, *values
    )
    return {k: str(v) if isinstance(v, UUID) else v for k, v in dict(workspace).items()}
