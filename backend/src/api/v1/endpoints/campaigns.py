from fastapi import APIRouter, Depends, HTTPException, Query
from uuid import UUID
from typing import Optional
from datetime import date, timedelta
import asyncpg

from src.api.deps import get_current_user, get_workspace_id, require_role
from src.core.encryption import decrypt_token
from src.db.session import get_pool
from src.integrations import meta
from src.integrations.meta import MetaAPIError

router = APIRouter()


# Body-based endpoints here take a raw `body: dict` (no Pydantic model),
# so unlike analytics.py's typed `date` query params, FastAPI never gets a
# chance to coerce these — they arrive as whatever JSON the frontend sent
# (e.g. the wizard's `<input type="date">` value, a plain "YYYY-MM-DD"
# string). asyncpg needs an actual `datetime.date` for a DATE column, so
# without this conversion every campaign create/update with a date set
# crashes with an unhandled 500 (which shows up in the browser as a CORS
# error, same as the earlier JSONB issue).
def _parse_date(value) -> Optional[date]:
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


@router.post("/{campaign_id}/deploy")
async def deploy_campaign(
    campaign_id: UUID,
    current_user: dict = Depends(require_role("admin", "manager")),
    pool: asyncpg.Pool = Depends(get_pool),
):
    workspace_id = current_user["workspace_id"]
    campaign = await pool.fetchrow(
        "SELECT * FROM campaigns WHERE id = $1 AND workspace_id = $2",
        campaign_id, workspace_id,
    )
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    # Phase 2 only wires up Meta. Other platforms fall through here until
    # their own integration exists, rather than silently pretending to deploy.
    if campaign["platform"] != "meta":
        raise HTTPException(
            status_code=400,
            detail=f"Deploying to {campaign['platform'].replace('_', ' ')} isn't supported yet — only Meta is available in this phase",
        )
    if campaign["platform_status"] == "deployed":
        raise HTTPException(status_code=400, detail="This campaign is already deployed to Meta")
    if not campaign["objective"]:
        raise HTTPException(status_code=400, detail="Set a campaign objective before deploying")

    connection = await pool.fetchrow(
        """SELECT * FROM platform_connections
           WHERE workspace_id = $1 AND platform = 'meta' AND status = 'connected'""",
        workspace_id,
    )
    if not connection:
        raise HTTPException(
            status_code=400,
            detail="Connect a Meta ad account in Settings → Integrations before deploying",
        )

    meta_objective = meta.OBJECTIVE_MAP.get(campaign["objective"], "OUTCOME_AWARENESS")

    # Meta requires a campaign to either carry its own budget or explicitly
    # opt out of ad-set budget sharing (see the is_adset_budget_sharing_enabled
    # branch in meta.create_campaign). Camparc's wizard already collects a
    # daily and/or total budget, so use whichever one this campaign actually
    # has rather than leaving the campaign unbudgeted. Amounts are converted
    # to minor currency units (cents) — correct for USD/GBP, the currencies
    # Camparc currently targets; would need adjusting for zero-decimal
    # currencies (e.g. JPY) if/when those are supported.
    daily_budget_cents = None
    lifetime_budget_cents = None
    start_time = None
    stop_time = None
    if campaign["budget_daily"]:
        daily_budget_cents = int(round(float(campaign["budget_daily"]) * 100))
    elif campaign["budget_total"] and campaign["end_date"]:
        # lifetime_budget requires Meta to know when the campaign stops —
        # only usable when an end date was actually set in the wizard.
        lifetime_budget_cents = int(round(float(campaign["budget_total"]) * 100))
        start_time = f"{campaign['start_date'] or datetime.utcnow().date()}T00:00:00+0000"
        stop_time = f"{campaign['end_date']}T23:59:59+0000"

    try:
        access_token = decrypt_token(connection["access_token_encrypted"])
        result = await meta.create_campaign(
            access_token, connection["external_account_id"], campaign["name"], meta_objective,
            daily_budget_cents=daily_budget_cents,
            lifetime_budget_cents=lifetime_budget_cents,
            start_time=start_time,
            stop_time=stop_time,
        )
    except (ValueError, MetaAPIError) as e:
        # Record the failure on the campaign itself so the UI can show *why*
        # without the user needing to dig through logs, and so a second
        # deploy attempt isn't left looking identical to a first attempt.
        await pool.execute(
            """UPDATE campaigns SET platform_status = 'failed', platform_error = $1, updated_at = NOW()
               WHERE id = $2""",
            str(e), campaign_id,
        )
        raise HTTPException(status_code=502, detail=str(e))

    row = await pool.fetchrow(
        """UPDATE campaigns
           SET platform_id = $1, platform_status = 'deployed', platform_deployed_at = NOW(),
               platform_error = NULL, updated_at = NOW()
           WHERE id = $2 RETURNING *""",
        result["id"], campaign_id,
    )
    await pool.execute(
        """INSERT INTO audit_logs (workspace_id, user_id, action, resource_type, resource_id, changes)
           VALUES ($1, $2, 'deploy', 'campaign', $3, $4)""",
        workspace_id, current_user["id"], campaign_id,
        {"platform": "meta", "platform_id": result["id"], "objective": meta_objective},
    )
    return {k: str(v) if isinstance(v, UUID) else v for k, v in dict(row).items()}


@router.post("/{campaign_id}/sync-performance")
async def sync_campaign_performance(
    campaign_id: UUID,
    current_user: dict = Depends(require_role("admin", "manager")),
    pool: asyncpg.Pool = Depends(get_pool),
):
    workspace_id = current_user["workspace_id"]
    campaign = await pool.fetchrow(
        "SELECT * FROM campaigns WHERE id = $1 AND workspace_id = $2",
        campaign_id, workspace_id,
    )
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    if campaign["platform"] != "meta":
        raise HTTPException(
            status_code=400,
            detail=f"Syncing performance for {campaign['platform'].replace('_', ' ')} isn't supported yet — only Meta is available in this phase",
        )
    if not campaign["platform_id"]:
        raise HTTPException(status_code=400, detail="Deploy this campaign to Meta before syncing performance")

    connection = await pool.fetchrow(
        """SELECT * FROM platform_connections
           WHERE workspace_id = $1 AND platform = 'meta' AND status = 'connected'""",
        workspace_id,
    )
    if not connection:
        raise HTTPException(
            status_code=400,
            detail="Connect a Meta ad account in Settings → Integrations before syncing",
        )

    # Pull from whenever the campaign was actually deployed (no point asking
    # Meta about days before it existed there) up to today; fall back to a
    # 30-day window for older data if that timestamp is somehow missing.
    since = campaign["platform_deployed_at"].date() if campaign["platform_deployed_at"] else date.today() - timedelta(days=30)
    until = date.today()
    if since > until:
        since = until

    try:
        access_token = decrypt_token(connection["access_token_encrypted"])
        daily_rows = await meta.get_campaign_insights(
            access_token, campaign["platform_id"], since.isoformat(), until.isoformat(),
        )
    except (ValueError, MetaAPIError) as e:
        raise HTTPException(status_code=502, detail=str(e))

    for row in daily_rows:
        await pool.execute(
            """INSERT INTO campaign_performance
               (campaign_id, date, spend, impressions, clicks, conversions, revenue, cpc, ctr, cpa, roas, synced_at)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
               ON CONFLICT (campaign_id, date) DO UPDATE SET
                 spend = EXCLUDED.spend,
                 impressions = EXCLUDED.impressions,
                 clicks = EXCLUDED.clicks,
                 conversions = EXCLUDED.conversions,
                 revenue = EXCLUDED.revenue,
                 cpc = EXCLUDED.cpc,
                 ctr = EXCLUDED.ctr,
                 cpa = EXCLUDED.cpa,
                 roas = EXCLUDED.roas,
                 synced_at = NOW()""",
            campaign_id, date.fromisoformat(row["date"]), row["spend"], row["impressions"], row["clicks"],
            row["conversions"], row["revenue"], row["cpc"], row["ctr"], row["cpa"], row["roas"],
        )

    await pool.execute("UPDATE campaigns SET last_synced_at = NOW() WHERE id = $1", campaign_id)
    await pool.execute(
        """INSERT INTO audit_logs (workspace_id, user_id, action, resource_type, resource_id, changes)
           VALUES ($1, $2, 'sync_performance', 'campaign', $3, $4)""",
        workspace_id, current_user["id"], campaign_id,
        {"days_synced": len(daily_rows), "since": since.isoformat(), "until": until.isoformat()},
    )

    return {
        "days_synced": len(daily_rows),
        "total_spend": sum(r["spend"] for r in daily_rows),
        "total_impressions": sum(r["impressions"] for r in daily_rows),
        "total_clicks": sum(r["clicks"] for r in daily_rows),
        "total_conversions": sum(r["conversions"] for r in daily_rows),
        "since": since.isoformat(),
        "until": until.isoformat(),
    }


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
