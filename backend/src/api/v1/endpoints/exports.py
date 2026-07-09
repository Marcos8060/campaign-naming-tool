from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from uuid import UUID
from typing import List, Optional
import asyncpg
import csv
import io
import json

from src.api.deps import get_current_user, get_workspace_id
from src.db.session import get_pool

router = APIRouter()

# Platform-specific column mappings
PLATFORM_FIELDS = {
    "meta": {
        "fieldnames": ["Campaign Name", "Objective", "Budget", "Daily Budget", "Start Time", "End Time", "Status"],
        "mapper": lambda c: {
            "Campaign Name": c.get("name", ""),
            "Objective": (c.get("objective") or "").upper(),
            "Budget": c.get("budget_total", ""),
            "Daily Budget": c.get("budget_daily", ""),
            "Start Time": c.get("start_date", ""),
            "End Time": c.get("end_date", ""),
            "Status": (c.get("status") or "").upper(),
        },
    },
    "google_ads": {
        "fieldnames": ["Campaign", "Campaign type", "Target CPA", "Budget", "Start date", "End date", "Status"],
        "mapper": lambda c: {
            "Campaign": c.get("name", ""),
            "Campaign type": "SEARCH",
            "Target CPA": "",
            "Budget": c.get("budget_daily", ""),
            "Start date": str(c.get("start_date", "") or "").replace("-", "/"),
            "End date": str(c.get("end_date", "") or "").replace("-", "/"),
            "Status": (c.get("status") or "").capitalize(),
        },
    },
    "tiktok": {
        "fieldnames": ["Campaign Name", "Advertising Objective", "Campaign Budget", "Status"],
        "mapper": lambda c: {
            "Campaign Name": c.get("name", ""),
            "Advertising Objective": (c.get("objective") or "").upper(),
            "Campaign Budget": c.get("budget_total", ""),
            "Status": "ENABLE" if c.get("status") == "active" else "DISABLE",
        },
    },
    "dv360": {
        "fieldnames": ["Campaign Name", "Goal Type", "Goal Value", "Total Budget", "Start Date", "End Date", "Status"],
        "mapper": lambda c: {
            "Campaign Name": c.get("name", ""),
            "Goal Type": c.get("objective", ""),
            "Goal Value": "",
            "Total Budget": c.get("budget_total", ""),
            "Start Date": c.get("start_date", ""),
            "End Date": c.get("end_date", ""),
            "Status": "Active" if c.get("status") == "active" else "Paused",
        },
    },
    "linkedin": {
        "fieldnames": ["Campaign Name", "Campaign Objective", "Campaign Type", "Daily Budget", "Start Date", "End Date", "Status"],
        "mapper": lambda c: {
            "Campaign Name": c.get("name", ""),
            "Campaign Objective": (c.get("objective") or "").upper(),
            "Campaign Type": "SPONSORED_CONTENT",
            "Daily Budget": c.get("budget_daily", ""),
            "Start Date": c.get("start_date", ""),
            "End Date": c.get("end_date", ""),
            "Status": "ACTIVE" if c.get("status") == "active" else "PAUSED",
        },
    },
}

GENERIC_FIELDS = ["id", "name", "platform", "platform_id", "objective", "budget_total", "budget_daily",
                  "start_date", "end_date", "status", "created_at"]


@router.get("")
async def list_exports(
    workspace_id: UUID = Depends(get_workspace_id),
    pool: asyncpg.Pool = Depends(get_pool),
    current_user: dict = Depends(get_current_user),
):
    rows = await pool.fetch(
        "SELECT * FROM exports WHERE workspace_id = $1 ORDER BY created_at DESC LIMIT 50",
        workspace_id
    )
    return [
        {k: str(v) if isinstance(v, UUID) else v for k, v in dict(r).items()}
        for r in rows
    ]


@router.post("/csv")
async def export_csv(
    body: dict,
    current_user: dict = Depends(get_current_user),
    pool: asyncpg.Pool = Depends(get_pool),
):
    workspace_id = current_user["workspace_id"]
    platform = body.get("platform")
    fmt = body.get("format", "generic")  # "generic" | "platform_native"
    campaign_ids = body.get("campaign_ids", [])

    query = "SELECT * FROM campaigns WHERE workspace_id = $1 AND status != 'archived'"
    params = [workspace_id]

    if campaign_ids:
        params.append([UUID(cid) for cid in campaign_ids])
        query += f" AND id = ANY(${len(params)})"
    if platform:
        params.append(platform)
        query += f" AND platform = ${len(params)}"

    query += " ORDER BY created_at DESC"
    campaigns = await pool.fetch(query, *params)

    output = io.StringIO()

    use_platform_fmt = fmt == "platform_native" and platform and platform in PLATFORM_FIELDS
    if use_platform_fmt:
        spec = PLATFORM_FIELDS[platform]
        fieldnames = spec["fieldnames"]
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()
        for campaign in campaigns:
            row = {k: str(v) if isinstance(v, UUID) else v for k, v in dict(campaign).items()}
            writer.writerow(spec["mapper"](row))
    else:
        fieldnames = GENERIC_FIELDS
        writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        for campaign in campaigns:
            row = {k: str(v) if isinstance(v, UUID) else v for k, v in dict(campaign).items()}
            writer.writerow({f: row.get(f, "") for f in fieldnames})

    output.seek(0)
    suffix = "_native" if use_platform_fmt else ""
    filename = f"campaigns_{platform or 'all'}{suffix}.csv"

    await pool.execute(
        """INSERT INTO exports (workspace_id, type, platform, status, created_by, completed_at)
           VALUES ($1, $2, $3, 'completed', $4, NOW())""",
        workspace_id,
        "csv",
        platform,
        current_user["id"],
    )

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
