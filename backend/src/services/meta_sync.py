"""Shared Meta performance-sync logic.

This is the one place that actually talks to Meta's Insights API and writes
the results into campaign_performance. It exists as its own module (rather
than living inline in the campaigns.py endpoint) so the manual "Sync
Performance" button and the scheduled background job call the exact same
code path — no risk of the two drifting apart over time.
"""

from datetime import date, timedelta

import asyncpg

from src.core.encryption import decrypt_token
from src.integrations import meta


class SyncSkipped(Exception):
    """Raised when a campaign isn't eligible to sync (not deployed, no
    connection, etc). Distinct from MetaAPIError so callers can tell
    'nothing to do here' apart from 'Meta rejected the request'."""


async def sync_campaign(pool: asyncpg.Pool, campaign: asyncpg.Record) -> dict:
    """Pull fresh daily insights for one campaign and upsert them.

    `campaign` must be a full row from the campaigns table. Raises
    SyncSkipped if the campaign isn't in a syncable state, or MetaAPIError /
    ValueError if the Meta call itself fails — callers decide how to handle
    each (the manual endpoint turns them into HTTP errors; the scheduler
    logs and moves on to the next campaign).
    """
    if campaign["platform"] != "meta":
        raise SyncSkipped(f"platform '{campaign['platform']}' not supported yet")
    if not campaign["platform_id"]:
        raise SyncSkipped("not deployed to Meta")

    connection = await pool.fetchrow(
        """SELECT * FROM platform_connections
           WHERE workspace_id = $1 AND platform = 'meta' AND status = 'connected'""",
        campaign["workspace_id"],
    )
    if not connection:
        raise SyncSkipped("no connected Meta account for this workspace")

    since = campaign["platform_deployed_at"].date() if campaign["platform_deployed_at"] else date.today() - timedelta(days=30)
    until = date.today()
    if since > until:
        since = until

    access_token = decrypt_token(connection["access_token_encrypted"])
    daily_rows = await meta.get_campaign_insights(
        access_token, campaign["platform_id"], since.isoformat(), until.isoformat(),
    )

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
            campaign["id"], date.fromisoformat(row["date"]), row["spend"], row["impressions"], row["clicks"],
            row["conversions"], row["revenue"], row["cpc"], row["ctr"], row["cpa"], row["roas"],
        )

    await pool.execute("UPDATE campaigns SET last_synced_at = NOW() WHERE id = $1", campaign["id"])

    return {
        "days_synced": len(daily_rows),
        "total_spend": sum(r["spend"] for r in daily_rows),
        "total_impressions": sum(r["impressions"] for r in daily_rows),
        "total_clicks": sum(r["clicks"] for r in daily_rows),
        "total_conversions": sum(r["conversions"] for r in daily_rows),
        "since": since.isoformat(),
        "until": until.isoformat(),
    }
