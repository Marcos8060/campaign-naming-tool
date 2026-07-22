import os
from uuid import UUID

import aiofiles
import asyncpg
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from src.api.deps import get_current_user, get_workspace_id
from src.db.session import get_pool

router = APIRouter()

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/svg+xml", "image/gif", "image/webp"}
MAX_SIZE = 10 * 1024 * 1024  # 10MB


@router.post("/upload")
async def upload_asset(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    pool: asyncpg.Pool = Depends(get_pool),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="File type not allowed")

    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    workspace_id = current_user["workspace_id"]
    upload_dir = f"uploads/{workspace_id}"
    os.makedirs(upload_dir, exist_ok=True)

    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "bin"
    from uuid import uuid4
    filename = f"{uuid4()}.{ext}"
    filepath = f"{upload_dir}/{filename}"

    async with aiofiles.open(filepath, "wb") as f:
        await f.write(content)

    public_url = f"/uploads/{workspace_id}/{filename}"

    row = await pool.fetchrow(
        """INSERT INTO campaign_assets (workspace_id, file_name, file_type, file_size, storage_path, public_url, uploaded_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *""",
        workspace_id, file.filename, file.content_type, len(content), filepath, public_url, current_user["id"]
    )
    return {k: str(v) if isinstance(v, UUID) else v for k, v in dict(row).items()}


@router.get("")
async def list_assets(
    workspace_id: UUID = Depends(get_workspace_id),
    pool: asyncpg.Pool = Depends(get_pool),
    current_user: dict = Depends(get_current_user),
):
    rows = await pool.fetch(
        "SELECT * FROM campaign_assets WHERE workspace_id = $1 AND campaign_id IS NULL ORDER BY created_at DESC",
        workspace_id
    )
    return [
        {k: str(v) if isinstance(v, UUID) else v for k, v in dict(r).items()}
        for r in rows
    ]
