from datetime import date, timedelta
from typing import Optional
from uuid import UUID

import asyncpg
from fastapi import APIRouter, Depends, Query

from src.api.deps import get_current_user, get_workspace_id
from src.db.session import get_pool

router = APIRouter()


@router.get("/overview")
async def get_overview(
    workspace_id: UUID = Depends(get_workspace_id),
    pool: asyncpg.Pool = Depends(get_pool),
    current_user: dict = Depends(get_current_user),
    days: int = Query(30, description="Number of days for trend comparison"),
):
    total_campaigns = await pool.fetchval(
        "SELECT COUNT(*) FROM campaigns WHERE workspace_id = $1 AND status != 'archived'",
        workspace_id
    )
    active_campaigns = await pool.fetchval(
        "SELECT COUNT(*) FROM campaigns WHERE workspace_id = $1 AND status = 'active'",
        workspace_id
    )
    draft_campaigns = await pool.fetchval(
        "SELECT COUNT(*) FROM campaigns WHERE workspace_id = $1 AND status = 'draft'",
        workspace_id
    )
    platforms = await pool.fetch(
        """SELECT platform, COUNT(*) as count, COALESCE(SUM(budget_total), 0) as total_budget
           FROM campaigns WHERE workspace_id = $1 AND status != 'archived'
           GROUP BY platform ORDER BY count DESC""",
        workspace_id
    )
    total_budget = await pool.fetchval(
        "SELECT COALESCE(SUM(budget_total), 0) FROM campaigns WHERE workspace_id = $1 AND status IN ('active', 'paused')",
        workspace_id
    )

    perf = await pool.fetchrow(
        """SELECT COALESCE(SUM(spend), 0) as total_spend,
                  COALESCE(SUM(impressions), 0) as total_impressions,
                  COALESCE(SUM(clicks), 0) as total_clicks,
                  COALESCE(SUM(conversions), 0) as total_conversions,
                  COALESCE(AVG(roas), 0) as avg_roas
           FROM campaign_performance cp
           JOIN campaigns c ON c.id = cp.campaign_id
           WHERE c.workspace_id = $1
           AND cp.date >= NOW() - INTERVAL '30 days'""",
        workspace_id
    )

    has_taxonomies = await pool.fetchval(
        "SELECT EXISTS(SELECT 1 FROM taxonomies WHERE workspace_id = $1 AND is_active = true)",
        workspace_id
    )
    has_platforms = await pool.fetchval(
        "SELECT EXISTS(SELECT 1 FROM platform_configs WHERE workspace_id = $1 AND is_active = true)",
        workspace_id
    )
    has_campaigns = await pool.fetchval(
        "SELECT EXISTS(SELECT 1 FROM campaigns WHERE workspace_id = $1)",
        workspace_id
    )

    return {
        "total_campaigns": total_campaigns,
        "active_campaigns": active_campaigns,
        "draft_campaigns": draft_campaigns,
        "total_budget": float(total_budget) if total_budget else 0,
        "platforms": [
            {k: float(v) if hasattr(v, '__float__') and v is not None else v for k, v in dict(p).items()}
            for p in platforms
        ],
        "performance": {
            "total_spend": float(perf["total_spend"]) if perf else 0,
            "total_impressions": int(perf["total_impressions"]) if perf else 0,
            "total_clicks": int(perf["total_clicks"]) if perf else 0,
            "total_conversions": int(perf["total_conversions"]) if perf else 0,
            "avg_roas": float(perf["avg_roas"]) if perf else 0,
        },
        "onboarding": {
            "workspace_created": True,
            "taxonomies_configured": has_taxonomies,
            "platforms_configured": has_platforms,
            "first_campaign_created": has_campaigns,
        }
    }


@router.get("/performance")
async def get_performance(
    workspace_id: UUID = Depends(get_workspace_id),
    pool: asyncpg.Pool = Depends(get_pool),
    current_user: dict = Depends(get_current_user),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    platform: Optional[str] = None,
    brand: Optional[str] = None,
    product: Optional[str] = None,
    region: Optional[str] = None,
):
    if not start_date:
        start_date = date.today() - timedelta(days=30)
    if not end_date:
        end_date = date.today()

    query = """
        SELECT cp.date,
               SUM(cp.spend) as spend,
               SUM(cp.impressions) as impressions,
               SUM(cp.clicks) as clicks,
               SUM(cp.conversions) as conversions,
               AVG(cp.roas) as roas,
               AVG(cp.ctr) as ctr
        FROM campaign_performance cp
        JOIN campaigns c ON c.id = cp.campaign_id
        WHERE c.workspace_id = $1 AND cp.date BETWEEN $2 AND $3
    """
    params = [workspace_id, start_date, end_date]

    if platform:
        params.append(platform)
        query += f" AND c.platform = ${len(params)}"

    query += " GROUP BY cp.date ORDER BY cp.date"
    rows = await pool.fetch(query, *params)

    return [
        {k: float(v) if hasattr(v, '__float__') and v is not None else str(v) if not isinstance(v, (str, int, bool, type(None))) else v
         for k, v in dict(r).items()}
        for r in rows
    ]


@router.get("/top-campaigns")
async def get_top_campaigns(
    workspace_id: UUID = Depends(get_workspace_id),
    pool: asyncpg.Pool = Depends(get_pool),
    current_user: dict = Depends(get_current_user),
    limit: int = Query(10, le=50),
):
    rows = await pool.fetch(
        """SELECT c.id, c.name, c.platform, c.status,
                  COALESCE(SUM(cp.spend), 0) as total_spend,
                  COALESCE(AVG(cp.roas), 0) as avg_roas,
                  COALESCE(SUM(cp.conversions), 0) as total_conversions,
                  COALESCE(SUM(cp.impressions), 0) as total_impressions
           FROM campaigns c
           LEFT JOIN campaign_performance cp ON cp.campaign_id = c.id
           WHERE c.workspace_id = $1 AND c.status != 'archived'
           GROUP BY c.id, c.name, c.platform, c.status
           ORDER BY avg_roas DESC, total_spend DESC
           LIMIT $2""",
        workspace_id, limit
    )
    return [
        {k: float(v) if hasattr(v, '__float__') and v is not None else str(v) if isinstance(v, UUID) else v
         for k, v in dict(r).items()}
        for r in rows
    ]


@router.get("/budget-intelligence")
async def get_budget_intelligence(
    workspace_id: UUID = Depends(get_workspace_id),
    pool: asyncpg.Pool = Depends(get_pool),
    current_user: dict = Depends(get_current_user),
):
    rows = await pool.fetch(
        """SELECT platform,
                  COUNT(*) as campaign_count,
                  COALESCE(SUM(budget_total), 0) as total_budget,
                  COALESCE(AVG(budget_total), 0) as avg_budget,
                  COALESCE(SUM(budget_daily), 0) as total_daily_budget
           FROM campaigns
           WHERE workspace_id = $1 AND status IN ('active', 'paused', 'draft')
           GROUP BY platform ORDER BY total_budget DESC""",
        workspace_id
    )
    return [
        {k: float(v) if hasattr(v, '__float__') and v is not None else v for k, v in dict(r).items()}
        for r in rows
    ]


@router.get("/audience-overlap")
async def get_audience_overlap(
    workspace_id: UUID = Depends(get_workspace_id),
    pool: asyncpg.Pool = Depends(get_pool),
    current_user: dict = Depends(get_current_user),
    platform: Optional[str] = None,
):
    # Returns simulated audience overlap data based on taxonomy values.
    # Campaigns sharing the same taxonomy values (brand, product, region) are likely targeting overlapping audiences.
    query = """SELECT id, name, platform, taxonomy_values, budget_total
               FROM campaigns WHERE workspace_id = $1 AND status IN ('active', 'paused')"""
    params = [workspace_id]
    if platform:
        params.append(platform)
        query += f" AND platform = ${len(params)}"
    query += " LIMIT 20"

    campaigns = await pool.fetch(query, *params)
    if len(campaigns) < 2:
        return {"campaigns": [], "overlaps": [], "high_overlap_pairs": []}

    campaign_list = []
    overlaps = []
    high_overlap_pairs = []

    for camp in campaigns:
        campaign_list.append({
            "id": str(camp["id"]),
            "name": camp["name"],
            "platform": camp["platform"],
            "budget_total": float(camp["budget_total"]) if camp["budget_total"] else 0,
        })

    for i, a in enumerate(campaigns):
        for j, b in enumerate(campaigns):
            if i >= j:
                continue
            tv_a = a["taxonomy_values"] or {}
            tv_b = b["taxonomy_values"] or {}

            shared_keys = set(tv_a.keys()) & set(tv_b.keys())
            matching = sum(1 for k in shared_keys if tv_a.get(k) == tv_b.get(k))
            total_keys = len(set(tv_a.keys()) | set(tv_b.keys()))

            overlap_pct = round((matching / total_keys * 100) if total_keys > 0 else 0)

            min_budget = min(
                float(a["budget_total"]) if a["budget_total"] else 0,
                float(b["budget_total"]) if b["budget_total"] else 0
            )
            wasted_spend = round(min_budget * (overlap_pct / 100) * 0.15, 2)

            pair = {
                "campaign_a_id": str(a["id"]),
                "campaign_a_name": a["name"],
                "campaign_b_id": str(b["id"]),
                "campaign_b_name": b["name"],
                "overlap_percentage": overlap_pct,
                "wasted_spend_estimate": wasted_spend,
                "shared_taxonomy": {k: tv_a[k] for k in shared_keys if tv_a.get(k) == tv_b.get(k)},
            }
            overlaps.append(pair)
            if overlap_pct >= 50:
                high_overlap_pairs.append(pair)

    return {
        "campaigns": campaign_list,
        "overlaps": overlaps,
        "high_overlap_pairs": sorted(high_overlap_pairs, key=lambda x: x["overlap_percentage"], reverse=True),
    }
