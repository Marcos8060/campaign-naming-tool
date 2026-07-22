from uuid import UUID

import asyncpg
from fastapi import APIRouter, Depends

from src.api.deps import get_current_user, get_workspace_id, require_role
from src.db.session import get_pool

router = APIRouter()

DEFAULT_TEMPLATES = {
    "meta": "{brand}_{product}_{region}_{objective}_{audience}_{placement}",
    "google_ads": "{brand}-{product}-{region}-{objective}-{match_type}",
    "tiktok": "{brand}_{product}_{region}_{objective}_{format}",
    "dv360": "{brand}_{product}_{region}_{objective}_{placement}_{format}",
    "linkedin": "{brand}_{product}_{region}_{objective}_{audience}",
}


@router.get("")
async def list_platforms(
    workspace_id: UUID = Depends(get_workspace_id),
    pool: asyncpg.Pool = Depends(get_pool),
    current_user: dict = Depends(get_current_user),
):
    rows = await pool.fetch(
        "SELECT * FROM platform_configs WHERE workspace_id = $1 AND is_active = true ORDER BY platform",
        workspace_id
    )
    result = []
    for r in rows:
        d = {k: str(v) if isinstance(v, UUID) else v for k, v in dict(r).items()}
        result.append(d)

    existing_platforms = {r["platform"] for r in result}
    all_platforms = ["meta", "google_ads", "tiktok", "dv360", "linkedin"]

    for p in all_platforms:
        if p not in existing_platforms:
            result.append({
                "id": None,
                "platform": p,
                "naming_template": DEFAULT_TEMPLATES.get(p, ""),
                "separator": "_",
                "max_length": 255,
                "is_active": False,
                "is_configured": False,
            })

    return result


@router.post("")
async def create_or_update_platform(
    body: dict,
    current_user: dict = Depends(require_role("admin", "manager")),
    pool: asyncpg.Pool = Depends(get_pool),
):
    workspace_id = current_user["workspace_id"]

    row = await pool.fetchrow(
        """INSERT INTO platform_configs (workspace_id, platform, naming_template, id_format, separator, max_length, validation_rules)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (workspace_id, platform) DO UPDATE SET
             naming_template = EXCLUDED.naming_template,
             id_format = EXCLUDED.id_format,
             separator = EXCLUDED.separator,
             max_length = EXCLUDED.max_length,
             validation_rules = EXCLUDED.validation_rules,
             is_active = true,
             updated_at = NOW()
           RETURNING *""",
        workspace_id,
        body["platform"],
        body.get("naming_template", DEFAULT_TEMPLATES.get(body["platform"], "")),
        body.get("id_format"),
        body.get("separator", "_"),
        body.get("max_length", 255),
        body.get("validation_rules", {}),
    )
    return {k: str(v) if isinstance(v, UUID) else v for k, v in dict(row).items()}
