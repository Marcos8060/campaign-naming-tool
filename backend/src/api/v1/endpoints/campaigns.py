from fastapi import APIRouter, Depends, HTTPException, Query
from uuid import UUID
from typing import Optional
from datetime import date
import asyncpg

from src.api.deps import get_current_user, get_workspace_id, require_role
from src.db.session import get_pool

router = APIRouter()


def _parse_date(value) -> Optional[date]:
    """Body-based endpoints here take a raw `body: dict` (no Pydantic model),
    so unlike analytics.py's typed `date` query params, FastAPI never gets a
    chance to coerce these — they arrive as whatever JSON the frontend sent
    (e.g. the wizard's `<input type="date">` value, a plain "YYYY-MM-DD"
    string). asyncpg needs an actual `datetime.date` for a DATE column, so
    without this conversion every campaign create/update with a date set
    crashes with an unhandled 500 (which shows up in the browser as a CORS
    error, same as the earlier JSONB issue)."""
    if not value:
        return None
    if isinstance(value, date):
        return value
    return date.fromisoformat(value)

ALLOWED_SORT = {"name", "budget_total", "created_at", "start_date", "status", "platform"}


@router.get("")
async def list_campaigns(
    workspace_id: UUID = Depends(get_workspace_id),
    pool: asyncpg.Pool = Depends(get_pool),
    current_user: dict = Depends(get_current_user),
    platform: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
    limit: int = Query(50, le=200),
    offset: int = 0,
):
    if sort_by not in ALLOWED_SORT:
        sort_by = "created_at"
    if sort_order not in ("asc", "desc"):
        sort_order = "desc"

    query = "SELECT * FROM campaigns WHERE workspace_id = $1"
    params = [workspace_id]

    if platform:
        params.append(platform)
        query += f" AND platform = ${len(params)}"
    if status:
        params.append(status)
        query += f" AND status = ${len(params)}"
    if search:
        params.append(f"%{search}%")
        query += f" AND (name ILIKE ${len(params)} OR platform_id ILIKE ${len(params)})"

    count_query = query.replace("SELECT *", "SELECT COUNT(*)")
    total = await pool.fetchval(count_query, *params)

    params.extend([limit, offset])
    query += f" ORDER BY {sort_by} {sort_order} LIMIT ${len(params)-1} OFFSET ${len(params)}"

    rows = await pool.fetch(query, *params)

    return {
        "campaigns": [
            {k: str(v) if isinstance(v, UUID) else v for k, v in dict(r).items()}
            for r in rows
        ],
        "total": total,
        "limit": limit,
        "offset": offset,
    }


@router.post("")
async def create_campaign(
    body: dict,
    current_user: dict = Depends(require_role("admin", "manager")),
    pool: asyncpg.Pool = Depends(get_pool),
):
    workspace_id = current_user["workspace_id"]

    row = await pool.fetchrow(
        """INSERT INTO campaigns (workspace_id, name, platform, platform_id, taxonomy_values,
           objective, budget_total, budget_daily, start_date, end_date, configuration, status, created_by)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *""",
        workspace_id,
        body["name"],
        body["platform"],
        body.get("platform_id"),
        body.get("taxonomy_values", {}),
        body.get("objective"),
        float(body["budget_total"]) if body.get("budget_total") else None,
        float(body["budget_daily"]) if body.get("budget_daily") else None,
        _parse_date(body.get("start_date")),
        _parse_date(body.get("end_date")),
        body.get("configuration", {}),
        body.get("status", "draft"),
        current_user["id"],
    )

    # Create audit log
    await pool.execute(
        """INSERT INTO audit_logs (workspace_id, user_id, action, resource_type, resource_id, changes)
           VALUES ($1, $2, 'create', 'campaign', $3, $4)""",
        workspace_id, current_user["id"], row["id"], {"name": row["name"]}
    )

    return {k: str(v) if isinstance(v, UUID) else v for k, v in dict(row).items()}


@router.get("/{campaign_id}")
async def get_campaign(
    campaign_id: UUID,
    workspace_id: UUID = Depends(get_workspace_id),
    pool: asyncpg.Pool = Depends(get_pool),
    current_user: dict = Depends(get_current_user),
):
    row = await pool.fetchrow(
        """SELECT c.*, u.name as created_by_name
           FROM campaigns c
           LEFT JOIN users u ON u.id = c.created_by
           WHERE c.id = $1 AND c.workspace_id = $2""",
        campaign_id, workspace_id
    )
    if not row:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return {k: str(v) if isinstance(v, UUID) else v for k, v in dict(row).items()}


@router.patch("/{campaign_id}")
async def update_campaign(
    campaign_id: UUID,
    body: dict,
    current_user: dict = Depends(require_role("admin", "manager")),
    pool: asyncpg.Pool = Depends(get_pool),
):
    workspace_id = current_user["workspace_id"]
    allowed = {"name", "platform_id", "taxonomy_values", "objective", "budget_total", "budget_daily",
               "start_date", "end_date", "configuration", "status"}
    updates = {k: v for k, v in body.items() if k in allowed}
    if not updates:
        raise HTTPException(status_code=400, detail="No valid fields")
    for date_field in ("start_date", "end_date"):
        if date_field in updates:
            updates[date_field] = _parse_date(updates[date_field])

    set_clause = ", ".join([f"{k} = ${i+3}" for i, k in enumerate(updates.keys())])
    values = list(updates.values())

    row = await pool.fetchrow(
        f"UPDATE campaigns SET {set_clause}, updated_at = NOW() WHERE id = $1 AND workspace_id = $2 RETURNING *",
        campaign_id, workspace_id, *values
    )
    if not row:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return {k: str(v) if isinstance(v, UUID) else v for k, v in dict(row).items()}


@router.patch("/{campaign_id}/status")
async def change_status(
    campaign_id: UUID,
    body: dict,
    current_user: dict = Depends(require_role("admin", "manager")),
    pool: asyncpg.Pool = Depends(get_pool),
):
    allowed_statuses = {"draft", "active", "paused", "completed", "archived"}
    new_status = body.get("status")
    if new_status not in allowed_statuses:
        raise HTTPException(status_code=400, detail=f"Status must be one of {allowed_statuses}")

    row = await pool.fetchrow(
        "UPDATE campaigns SET status = $1, updated_at = NOW() WHERE id = $2 AND workspace_id = $3 RETURNING *",
        new_status, campaign_id, current_user["workspace_id"]
    )
    if not row:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return {k: str(v) if isinstance(v, UUID) else v for k, v in dict(row).items()}


@router.post("/{campaign_id}/duplicate")
async def duplicate_campaign(
    campaign_id: UUID,
    current_user: dict = Depends(require_role("admin", "manager")),
    pool: asyncpg.Pool = Depends(get_pool),
):
    workspace_id = current_user["workspace_id"]
    original = await pool.fetchrow(
        "SELECT * FROM campaigns WHERE id = $1 AND workspace_id = $2",
        campaign_id, workspace_id
    )
    if not original:
        raise HTTPException(status_code=404, detail="Campaign not found")

    new_row = await pool.fetchrow(
        """INSERT INTO campaigns (workspace_id, name, platform, taxonomy_values, objective,
           budget_total, budget_daily, start_date, end_date, configuration, status, created_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'draft', $11) RETURNING *""",
        workspace_id,
        f"Copy of {original['name']}",
        original["platform"],
        original["taxonomy_values"],
        original["objective"],
        original["budget_total"],
        original["budget_daily"],
        original["start_date"],
        original["end_date"],
        original["configuration"],
        current_user["id"],
    )
    return {k: str(v) if isinstance(v, UUID) else v for k, v in dict(new_row).items()}


@router.delete("/{campaign_id}")
async def delete_campaign(
    campaign_id: UUID,
    current_user: dict = Depends(require_role("admin", "manager")),
    pool: asyncpg.Pool = Depends(get_pool),
):
    await pool.execute(
        "UPDATE campaigns SET status = 'archived' WHERE id = $1 AND workspace_id = $2",
        campaign_id, current_user["workspace_id"]
    )
    return {"success": True}
