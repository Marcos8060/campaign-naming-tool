import httpx

from src.config import settings

GRAPH_BASE = f"https://graph.facebook.com/{settings.meta_api_version}"
DIALOG_BASE = f"https://www.facebook.com/{settings.meta_api_version}/dialog/oauth"

# Minimum scopes needed to read ad accounts and eventually manage campaigns.
# Requesting anything broader than this just adds friction to Meta's app review.
SCOPES = ["ads_management", "ads_read", "business_management"]


class MetaAPIError(Exception):
    def __init__(self, message: str, status_code: int | None = None):
        super().__init__(message)
        self.status_code = status_code


def _error_message(data: dict, fallback: str) -> str:
    # Meta's top-level error.message is often a generic bucket (e.g. plain
    # "Invalid parameter" for code 100), while the actually-useful, specific
    # explanation lives in error_user_msg/error_user_title or error_subcode.
    # Surfacing only `message` (as earlier versions of this file did) hides
    # exactly the detail needed to diagnose a failed deploy — so pull in
    # every field Meta provides and join whichever ones are present.
    err = data.get("error", {})
    parts = [err.get("error_user_title"), err.get("error_user_msg"), err.get("message")]
    msg = " — ".join(p for p in parts if p) or fallback
    if err.get("error_subcode"):
        msg += f" (subcode {err['error_subcode']})"
    return msg


def build_oauth_url(redirect_uri: str, state: str) -> str:
    url = httpx.URL(DIALOG_BASE, params={
        "client_id": settings.meta_app_id,
        "redirect_uri": redirect_uri,
        "state": state,
        "scope": ",".join(SCOPES),
        "response_type": "code",
    })
    return str(url)


async def exchange_code_for_token(code: str, redirect_uri: str) -> dict:
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(f"{GRAPH_BASE}/oauth/access_token", params={
            "client_id": settings.meta_app_id,
            "client_secret": settings.meta_app_secret,
            "redirect_uri": redirect_uri,
            "code": code,
        })
    data = resp.json()
    if resp.status_code != 200 or "access_token" not in data:
        raise MetaAPIError(_error_message(data, "Failed to exchange code for token"), resp.status_code)
    return data


async def exchange_long_lived_token(short_lived_token: str) -> dict:
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(f"{GRAPH_BASE}/oauth/access_token", params={
            "grant_type": "fb_exchange_token",
            "client_id": settings.meta_app_id,
            "client_secret": settings.meta_app_secret,
            "fb_exchange_token": short_lived_token,
        })
    data = resp.json()
    if resp.status_code != 200 or "access_token" not in data:
        raise MetaAPIError(_error_message(data, "Failed to exchange for a long-lived token"), resp.status_code)
    return data


async def get_ad_accounts(access_token: str) -> list[dict]:
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(f"{GRAPH_BASE}/me/adaccounts", params={
            "fields": "id,name,account_status,currency,timezone_name",
            "access_token": access_token,
        })
    data = resp.json()
    if resp.status_code != 200:
        raise MetaAPIError(_error_message(data, "Failed to fetch ad accounts"), resp.status_code)
    return data.get("data", [])


# Camparc's taxonomy uses generic, platform-agnostic objective names so the same
# campaign concept maps cleanly across Meta/Google/TikTok/etc. Meta itself only
# accepts its own "Outcome-Driven Ad Experiences" (ODAX) enum, so this table is
# the one place that translation happens. Anything not listed here (or an
# objective Meta later renames) falls back to OUTCOME_AWARENESS rather than
# raising, since deploy() shouldn't hard-fail over a naming mismatch.
OBJECTIVE_MAP = {
    "awareness": "OUTCOME_AWARENESS",
    "consideration": "OUTCOME_ENGAGEMENT",
    "conversion": "OUTCOME_SALES",
    "retention": "OUTCOME_ENGAGEMENT",
    "traffic": "OUTCOME_TRAFFIC",
    "leads": "OUTCOME_LEADS",
}


async def create_campaign(
    access_token: str,
    ad_account_id: str,
    name: str,
    objective: str,
    daily_budget_cents: int | None = None,
    lifetime_budget_cents: int | None = None,
    start_time: str | None = None,
    stop_time: str | None = None,
) -> dict:
    # ad_account_id is stored as returned by /me/adaccounts, which already
    # includes the "act_" prefix Meta's campaign-creation endpoint requires —
    # but guard here anyway in case a connection was ever seeded without it.
    account = ad_account_id if ad_account_id.startswith("act_") else f"act_{ad_account_id}"
    params = {
        "name": name,
        "objective": objective,
        # Always created paused. Camparc pushes the campaign structure to
        # Meta, but nothing should start spending real money until a human
        # explicitly activates it — either in Meta Ads Manager or, later,
        # via Camparc's own Activate action. This is the same
        # human-in-the-loop principle Phase 5 (Approve) formalizes further.
        "status": "PAUSED",
        # Required by Meta on every new campaign since the special ad
        # categories policy rollout (housing/credit/employment/etc ads
        # need extra restrictions declared). Camparc doesn't run any of
        # those verticals today, so this is always an empty declaration.
        "special_ad_categories": "[]",
        "access_token": access_token,
    }

    if daily_budget_cents is not None:
        params["daily_budget"] = daily_budget_cents
    elif lifetime_budget_cents is not None:
        params["lifetime_budget"] = lifetime_budget_cents
        if start_time:
            params["start_time"] = start_time
        if stop_time:
            params["stop_time"] = stop_time
    else:
        # Meta rejects campaign creation with "Invalid parameter (subcode
        # 4834011)" unless a campaign has its own budget OR this flag is set
        # explicitly — it's asking whether ad sets under the campaign should
        # pool/share budget. Camparc doesn't create ad sets yet, so there's
        # nothing to share; always False until that phase exists.
        params["is_adset_budget_sharing_enabled"] = "false"

    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(f"{GRAPH_BASE}/{account}/campaigns", params=params)
    data = resp.json()
    if resp.status_code != 200 or "id" not in data:
        raise MetaAPIError(_error_message(data, "Failed to create campaign on Meta"), resp.status_code)
    return data
