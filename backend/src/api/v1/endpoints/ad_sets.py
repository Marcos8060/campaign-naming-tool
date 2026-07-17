from uuid import UUID

import asyncpg
from fastapi import APIRouter, Depends, HTTPException

from src.api.deps import get_current_user, get_workspace_id, require_role
from src.core.encryption import decrypt_token
from src.db.session import get_pool
from src.integrations import meta
from src.integrations.meta import MetaAPIError

router = APIRouter()


def _serialize(row) -> dict:
    return {k: str(v) if isinstance(v, UUID) else v for k, v in dict(row).items()}


@router.delete("/{ad_set_id}")
async def delete_ad_set(
    ad_set_id: UUID,
    current_user: dict = Depends(require_role("admin", "manager")),
    pool: asyncpg.Pool = Depends(get_pool),
):
    workspace_id = current_user["workspace_id"]
    ad_set = await pool.fetchrow(
        "SELECT * FROM campaign_ad_sets WHERE id = $1 AND workspace_id = $2",
        ad_set_id, workspace_id,
    )
    if not ad_set:
        raise HTTPException(status_code=404, detail="Ad set not found")
    if ad_set["status"] == "deployed":
        # Deleting Camparc's record of something that's actually live on
        # Meta would just orphan it there with no way to find it again —
        # only failed/never-attempted rows are safe to remove.
        raise HTTPException(
            status_code=400,
            detail="This ad set is live on Meta — disable it there directly rather than deleting it here",
        )

    await pool.execute("DELETE FROM campaign_ad_sets WHERE id = $1", ad_set_id)
    await pool.execute(
        """INSERT INTO audit_logs (workspace_id, user_id, action, resource_type, resource_id, changes)
           VALUES ($1, $2, 'delete', 'ad_set', $3, $4)""",
        workspace_id, current_user["id"], ad_set_id, {"name": ad_set["name"], "status": ad_set["status"]},
    )
    return {"success": True}


@router.get("/{ad_set_id}/ads")
async def list_ads(
    ad_set_id: UUID,
    workspace_id: UUID = Depends(get_workspace_id),
    pool: asyncpg.Pool = Depends(get_pool),
    current_user: dict = Depends(get_current_user),
):
    rows = await pool.fetch(
        "SELECT * FROM campaign_ads WHERE ad_set_id = $1 AND workspace_id = $2 ORDER BY created_at",
        ad_set_id, workspace_id,
    )
    return [_serialize(r) for r in rows]


@router.post("/{ad_set_id}/ads")
async def create_ad(
    ad_set_id: UUID,
    body: dict,
    current_user: dict = Depends(require_role("admin", "manager")),
    pool: asyncpg.Pool = Depends(get_pool),
):
    workspace_id = current_user["workspace_id"]

    ad_set = await pool.fetchrow(
        "SELECT * FROM campaign_ad_sets WHERE id = $1 AND workspace_id = $2",
        ad_set_id, workspace_id,
    )
    if not ad_set:
        raise HTTPException(status_code=404, detail="Ad set not found")
    if ad_set["status"] != "deployed" or not ad_set["platform_ad_set_id"]:
        raise HTTPException(status_code=400, detail="Deploy this ad set to Meta before adding an ad")

    asset_id = body.get("asset_id")
    headline = body.get("headline")
    primary_text = body.get("primary_text")
    link_url = body.get("link_url")
    call_to_action = body.get("call_to_action", "LEARN_MORE")
    if not asset_id or not headline or not primary_text or not link_url:
        raise HTTPException(status_code=400, detail="asset_id, headline, primary_text, and link_url are all required")
    if call_to_action not in meta.CALL_TO_ACTION_TYPES:
        raise HTTPException(status_code=400, detail=f"call_to_action must be one of {meta.CALL_TO_ACTION_TYPES}")

    asset = await pool.fetchrow(
        "SELECT * FROM campaign_assets WHERE id = $1 AND workspace_id = $2",
        UUID(asset_id), workspace_id,
    )
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    connection = await pool.fetchrow(
        """SELECT * FROM platform_connections
           WHERE workspace_id = $1 AND platform = 'meta' AND status = 'connected'""",
        workspace_id,
    )
    if not connection:
        raise HTTPException(status_code=400, detail="Connect a Meta ad account in Settings → Integrations first")
    if not connection["page_id"]:
        raise HTTPException(
            status_code=400,
            detail="Select a default Facebook Page in Settings → Integrations before creating ads",
        )

    row = await pool.fetchrow(
        """INSERT INTO campaign_ads
           (ad_set_id, workspace_id, asset_id, headline, primary_text, link_url, call_to_action, created_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *""",
        ad_set_id, workspace_id, UUID(asset_id), headline, primary_text, link_url, call_to_action, current_user["id"],
    )

    try:
        access_token = decrypt_token(connection["access_token_encrypted"])
        # Read the asset's bytes off disk and hand them to Meta directly —
        # see upload_image_bytes()'s docstring for why this can't just pass
        # Camparc's own asset URL for Meta to fetch instead.
        with open(asset["storage_path"], "rb") as f:
            content = f.read()
        image_hash = await meta.upload_image_bytes(
            access_token, connection["external_account_id"], asset["file_name"], content, asset["file_type"],
        )
        creative = await meta.create_ad_creative(
            access_token, connection["external_account_id"], connection["page_id"], image_hash,
            headline, primary_text, link_url, call_to_action, f"{headline} — Creative",
        )
        ad_result = await meta.create_ad(
            access_token, connection["external_account_id"], ad_set["platform_ad_set_id"], creative["id"], headline,
        )
    except (ValueError, MetaAPIError, OSError) as e:
        await pool.execute(
            "UPDATE campaign_ads SET status = 'failed', platform_error = $1, updated_at = NOW() WHERE id = $2",
            str(e), row["id"],
        )
        raise HTTPException(status_code=502, detail=str(e))

    updated = await pool.fetchrow(
        """UPDATE campaign_ads
           SET platform_creative_id = $1, platform_ad_id = $2, status = 'deployed',
               platform_error = NULL, updated_at = NOW()
           WHERE id = $3 RETURNING *""",
        creative["id"], ad_result["id"], row["id"],
    )
    await pool.execute(
        """INSERT INTO audit_logs (workspace_id, user_id, action, resource_type, resource_id, changes)
           VALUES ($1, $2, 'deploy', 'ad', $3, $4)""",
        workspace_id, current_user["id"], row["id"], {"platform_ad_id": ad_result["id"]},
    )
    return _serialize(updated)


@router.delete("/{ad_set_id}/ads/{ad_id}")
async def delete_ad(
    ad_set_id: UUID,
    ad_id: UUID,
    current_user: dict = Depends(require_role("admin", "manager")),
    pool: asyncpg.Pool = Depends(get_pool),
):
    workspace_id = current_user["workspace_id"]
    ad = await pool.fetchrow(
        "SELECT * FROM campaign_ads WHERE id = $1 AND ad_set_id = $2 AND workspace_id = $3",
        ad_id, ad_set_id, workspace_id,
    )
    if not ad:
        raise HTTPException(status_code=404, detail="Ad not found")
    if ad["status"] == "deployed":
        # Same rule as ad sets — never delete Camparc's record of something
        # that's actually live on Meta, that would just orphan it there.
        raise HTTPException(
            status_code=400,
            detail="This ad is live on Meta — pause or remove it there directly rather than deleting it here",
        )

    await pool.execute("DELETE FROM campaign_ads WHERE id = $1", ad_id)
    await pool.execute(
        """INSERT INTO audit_logs (workspace_id, user_id, action, resource_type, resource_id, changes)
           VALUES ($1, $2, 'delete', 'ad', $3, $4)""",
        workspace_id, current_user["id"], ad_id, {"headline": ad["headline"], "status": ad["status"]},
    )
    return {"success": True}
