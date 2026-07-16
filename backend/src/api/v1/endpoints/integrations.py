from datetime import datetime, timedelta
from uuid import UUID

import asyncpg
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse

from src.api.deps import get_current_user, get_workspace_id, require_role
from src.config import settings
from src.core.encryption import decrypt_token, encrypt_token
from src.core.security import create_oauth_state, verify_oauth_state
from src.db.session import get_pool
from src.integrations import meta
from src.integrations.meta import MetaAPIError

router = APIRouter()


def _serialize(row) -> dict:
    d = {k: str(v) if isinstance(v, UUID) else v for k, v in dict(row).items()}
    d.pop("access_token_encrypted", None)
    return d


@router.get("")
async def list_connections(
    workspace_id: UUID = Depends(get_workspace_id),
    pool: asyncpg.Pool = Depends(get_pool),
    current_user: dict = Depends(get_current_user),
):
    rows = await pool.fetch(
        "SELECT * FROM platform_connections WHERE workspace_id = $1 AND status != 'revoked' ORDER BY platform",
        workspace_id,
    )
    return [_serialize(r) for r in rows]


@router.post("/meta/connect")
async def meta_connect(current_user: dict = Depends(require_role("admin"))):
    if not settings.meta_app_id or not settings.meta_app_secret:
        raise HTTPException(status_code=500, detail="Meta app credentials are not configured on this server yet")

    state = create_oauth_state({
        "workspace_id": str(current_user["workspace_id"]),
        "user_id": str(current_user["id"]),
    })
    redirect_uri = f"{settings.oauth_redirect_base_url}/api/v1/integrations/meta/callback"
    return {"authorize_url": meta.build_oauth_url(redirect_uri, state)}


@router.get("/meta/callback")
async def meta_callback(
    code: str = Query(None),
    state: str = Query(None),
    error: str = Query(None),
    pool: asyncpg.Pool = Depends(get_pool),
):
    frontend_base = settings.frontend_url.rstrip("/")

    if error or not code or not state:
        return RedirectResponse(f"{frontend_base}/settings/integrations?error=access_denied")

    try:
        payload = verify_oauth_state(state)
    except HTTPException:
        return RedirectResponse(f"{frontend_base}/settings/integrations?error=invalid_state")

    workspace_id = UUID(payload["workspace_id"])
    user_id = UUID(payload["user_id"])
    redirect_uri = f"{settings.oauth_redirect_base_url}/api/v1/integrations/meta/callback"

    try:
        short_lived = await meta.exchange_code_for_token(code, redirect_uri)
        long_lived = await meta.exchange_long_lived_token(short_lived["access_token"])
        accounts = await meta.get_ad_accounts(long_lived["access_token"])
    except MetaAPIError:
        return RedirectResponse(f"{frontend_base}/settings/integrations?error=meta_api_error")

    encrypted = encrypt_token(long_lived["access_token"])
    expires_in = long_lived.get("expires_in")
    expires_at = datetime.utcnow() + timedelta(seconds=int(expires_in)) if expires_in else None
    scopes = ",".join(meta.SCOPES)

    if not accounts:
        return RedirectResponse(f"{frontend_base}/settings/integrations?error=no_ad_accounts")

    if len(accounts) == 1:
        acct = accounts[0]
        await pool.execute(
            """INSERT INTO platform_connections
               (workspace_id, platform, status, external_account_id, external_account_name,
                access_token_encrypted, token_expires_at, scopes, connected_by)
               VALUES ($1, 'meta', 'connected', $2, $3, $4, $5, $6, $7)
               ON CONFLICT (workspace_id, platform, external_account_id) DO UPDATE SET
                 external_account_name = EXCLUDED.external_account_name,
                 access_token_encrypted = EXCLUDED.access_token_encrypted,
                 token_expires_at = EXCLUDED.token_expires_at,
                 status = 'connected',
                 updated_at = NOW()""",
            workspace_id, acct["id"], acct.get("name", acct["id"]),
            encrypted, expires_at, scopes, user_id,
        )
        await pool.execute(
            """INSERT INTO audit_logs (workspace_id, user_id, action, resource_type, resource_id, changes)
               VALUES ($1, $2, 'connect', 'platform_connection', NULL, $3)""",
            workspace_id, user_id, {"platform": "meta", "account": acct.get("name")},
        )
        return RedirectResponse(f"{frontend_base}/settings/integrations?connected=meta")

    # More than one ad account on this Meta login — let the user pick which one to connect
    # rather than guessing, since a business login can see accounts that aren't this workspace's.
    # Clear out any earlier pending attempt for this workspace+platform first — otherwise every
    # abandoned or repeated Connect click leaves another orphaned placeholder row behind.
    await pool.execute(
        "DELETE FROM platform_connections WHERE workspace_id = $1 AND platform = 'meta' AND status = 'pending'",
        workspace_id,
    )
    row = await pool.fetchrow(
        """INSERT INTO platform_connections
           (workspace_id, platform, status, access_token_encrypted, token_expires_at, scopes, connected_by)
           VALUES ($1, 'meta', 'pending', $2, $3, $4, $5) RETURNING id""",
        workspace_id, encrypted, expires_at, scopes, user_id,
    )
    return RedirectResponse(
        f"{frontend_base}/settings/integrations?select_account=meta&connection_id={row['id']}"
    )


@router.get("/meta/ad-accounts")
async def meta_ad_accounts(
    connection_id: UUID = Query(...),
    workspace_id: UUID = Depends(get_workspace_id),
    pool: asyncpg.Pool = Depends(get_pool),
    current_user: dict = Depends(require_role("admin")),
):
    row = await pool.fetchrow(
        "SELECT * FROM platform_connections WHERE id = $1 AND workspace_id = $2 AND status = 'pending'",
        connection_id, workspace_id,
    )
    if not row:
        raise HTTPException(status_code=404, detail="No pending Meta connection found")

    try:
        token = decrypt_token(row["access_token_encrypted"])
        accounts = await meta.get_ad_accounts(token)
    except (ValueError, MetaAPIError) as e:
        raise HTTPException(status_code=502, detail=str(e))
    return accounts


@router.post("/meta/select-account")
async def meta_select_account(
    body: dict,
    workspace_id: UUID = Depends(get_workspace_id),
    pool: asyncpg.Pool = Depends(get_pool),
    current_user: dict = Depends(require_role("admin")),
):
    connection_id = UUID(body["connection_id"])
    ad_account_id = body["ad_account_id"]
    ad_account_name = body.get("ad_account_name", ad_account_id)

    pending = await pool.fetchrow(
        "SELECT * FROM platform_connections WHERE id = $1 AND workspace_id = $2 AND status = 'pending'",
        connection_id, workspace_id,
    )
    if not pending:
        raise HTTPException(status_code=404, detail="No pending Meta connection found")

    # Same upsert pattern as the single-account auto-connect path in /meta/callback:
    # target the (workspace, platform, ad account) unique key directly rather than
    # this specific pending row's id, so reconnecting an already-connected ad account
    # merges into its existing row atomically instead of racing a separate DELETE.
    updated = await pool.fetchrow(
        """INSERT INTO platform_connections
           (workspace_id, platform, status, external_account_id, external_account_name,
            access_token_encrypted, token_expires_at, scopes, connected_by)
           VALUES ($1, 'meta', 'connected', $2, $3, $4, $5, $6, $7)
           ON CONFLICT (workspace_id, platform, external_account_id) DO UPDATE SET
             external_account_name = EXCLUDED.external_account_name,
             access_token_encrypted = EXCLUDED.access_token_encrypted,
             token_expires_at = EXCLUDED.token_expires_at,
             scopes = EXCLUDED.scopes,
             status = 'connected',
             updated_at = NOW()
           RETURNING *""",
        workspace_id, ad_account_id, ad_account_name,
        pending["access_token_encrypted"], pending["token_expires_at"], pending["scopes"], pending["connected_by"],
    )
    # The pending placeholder row is now redundant — either it became the connected
    # row above (no-op here) or a different pre-existing row absorbed the upsert and
    # this one is orphaned. Either way it should no longer exist as a bare "pending".
    await pool.execute(
        "DELETE FROM platform_connections WHERE id = $1 AND status = 'pending'",
        connection_id,
    )
    await pool.execute(
        """INSERT INTO audit_logs (workspace_id, user_id, action, resource_type, resource_id, changes)
           VALUES ($1, $2, 'connect', 'platform_connection', $3, $4)""",
        workspace_id, current_user["id"], connection_id, {"platform": "meta", "account": ad_account_name},
    )
    return _serialize(updated)


@router.delete("/{platform}")
async def disconnect_platform(
    platform: str,
    workspace_id: UUID = Depends(get_workspace_id),
    pool: asyncpg.Pool = Depends(get_pool),
    current_user: dict = Depends(require_role("admin")),
):
    rows = await pool.fetch(
        """UPDATE platform_connections SET status = 'revoked', updated_at = NOW()
           WHERE workspace_id = $1 AND platform = $2 AND status != 'revoked' RETURNING id""",
        workspace_id, platform,
    )
    if rows:
        await pool.execute(
            """INSERT INTO audit_logs (workspace_id, user_id, action, resource_type, resource_id, changes)
               VALUES ($1, $2, 'disconnect', 'platform_connection', NULL, $3)""",
            workspace_id, current_user["id"], {"platform": platform},
        )
    return {"success": True}
