"""Background job that keeps campaign_performance fresh without anyone
having to click "Sync Performance" by hand.

Runs in-process inside the FastAPI app (APScheduler's AsyncIOScheduler) —
no separate worker container or Redis/Celery needed at this scale. Assumes
a single backend instance; if Camparc ever runs multiple replicas, this
would need a distributed lock (e.g. a Postgres advisory lock) so the same
campaign isn't synced twice at once. Not a concern yet.
"""

import logging
from datetime import datetime

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

from src.config import settings
from src.db.session import get_pool
from src.integrations.meta import MetaAPIError
from src.services.meta_sync import sync_campaign, SyncSkipped

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()


async def run_scheduled_sync() -> None:
    """One pass over every deployed Meta campaign, across all workspaces.

    Each campaign is synced independently — one failure (a revoked token,
    a rate limit, whatever) is logged and skipped rather than aborting the
    whole run, so a single bad connection can't silently stop every other
    workspace's campaigns from getting fresh data.
    """
    pool = await get_pool()
    campaigns = await pool.fetch(
        """SELECT * FROM campaigns
           WHERE platform = 'meta' AND platform_status = 'deployed' AND platform_id IS NOT NULL"""
    )

    if not campaigns:
        logger.info("Scheduled sync: no deployed Meta campaigns to sync")
        return

    synced, skipped, failed = 0, 0, 0
    for campaign in campaigns:
        try:
            await sync_campaign(pool, campaign)
            synced += 1
        except SyncSkipped as e:
            skipped += 1
            logger.info("Scheduled sync: skipped campaign %s (%s)", campaign["id"], e)
        except (ValueError, MetaAPIError) as e:
            failed += 1
            logger.warning("Scheduled sync: failed for campaign %s: %s", campaign["id"], e)

    logger.info(
        "Scheduled sync complete: %d synced, %d skipped, %d failed (of %d)",
        synced, skipped, failed, len(campaigns),
    )


def start_scheduler() -> None:
    scheduler.add_job(
        run_scheduled_sync,
        trigger=IntervalTrigger(hours=settings.sync_interval_hours),
        id="meta_performance_sync",
        replace_existing=True,
        # Fire once right at startup too, rather than making the first sync
        # wait a full interval before any data shows up.
        next_run_time=datetime.now(),
    )
    scheduler.start()
    logger.info("Scheduler started: syncing Meta performance every %d hour(s)", settings.sync_interval_hours)


def stop_scheduler() -> None:
    if scheduler.running:
        scheduler.shutdown(wait=False)
