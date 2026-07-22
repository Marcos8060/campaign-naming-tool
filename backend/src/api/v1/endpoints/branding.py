import os
from uuid import UUID

import aiofiles
import asyncpg
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from src.api.deps import get_current_user, require_role
from src.db.session import get_pool

router = APIRouter()


@router.get("")
async def get_branding(
    current_user: dict = Depends(get_current_user),
    pool: asyncpg.Pool = Depends(get_pool),
):
    workspace_id = current_user["workspace_id"]
    row = await pool.fetchrow(
        "SELECT * FROM workspace_themes WHERE workspace_id = $1",
        workspace_id
    )
    if not row:
        return {"workspace_id": str(workspace_id)}
    return {k: str(v) if isinstance(v, UUID) else v for k, v in dict(row).items()}


@router.patch("")
async def update_branding(
    body: dict,
    current_user: dict = Depends(require_role("admin")),
    pool: asyncpg.Pool = Depends(get_pool),
):
    workspace_id = current_user["workspace_id"]
    allowed = {"primary_color", "primary_hover", "secondary_color", "accent_color",
               "danger_color", "warning_color", "success_color", "background_primary",
               "background_secondary", "text_primary", "text_secondary", "border_color",
               "logo_url", "logo_dark_url", "favicon_url"}
    updates = {k: v for k, v in body.items() if k in allowed}
    if not updates:
        raise HTTPException(status_code=400, detail="No valid fields")

    set_clause = ", ".join([f"{k} = ${i+2}" for i, k in enumerate(updates.keys())])
    values = list(updates.values())

    row = await pool.fetchrow(
        f"""INSERT INTO workspace_themes (workspace_id) VALUES ($1)
            ON CONFLICT (workspace_id) DO UPDATE SET {set_clause}, updated_at = NOW()
            RETURNING *""",
        workspace_id, *values
    )
    return {k: str(v) if isinstance(v, UUID) else v for k, v in dict(row).items()}


@router.post("/logo")
async def upload_logo(
    file: UploadFile = File(...),
    logo_type: str = "light",
    current_user: dict = Depends(require_role("admin")),
    pool: asyncpg.Pool = Depends(get_pool),
):
    allowed = {"image/jpeg", "image/png", "image/svg+xml"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Only PNG, JPG, SVG allowed")

    content = await file.read()
    if len(content) > 2 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Logo max size is 2MB")

    workspace_id = current_user["workspace_id"]
    upload_dir = f"uploads/{workspace_id}/branding"
    os.makedirs(upload_dir, exist_ok=True)

    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "png"
    filename = f"logo_{logo_type}.{ext}"
    filepath = f"{upload_dir}/{filename}"

    async with aiofiles.open(filepath, "wb") as f:
        await f.write(content)

    public_url = f"/uploads/{workspace_id}/branding/{filename}"
    field = "logo_url" if logo_type == "light" else "logo_dark_url"

    await pool.execute(
        f"""INSERT INTO workspace_themes (workspace_id, {field}) VALUES ($1, $2)
            ON CONFLICT (workspace_id) DO UPDATE SET {field} = $2, updated_at = NOW()""",
        workspace_id, public_url
    )

    return {"url": public_url, "type": logo_type}
