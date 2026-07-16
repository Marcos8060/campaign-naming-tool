import json

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


# Meta reports "conversions" through a generic `actions` list keyed by
# action_type (e.g. "purchase", "lead", "link_click") rather than a single
# flat number — which action_type actually counts as *the* conversion
# depends on what the campaign is optimizing for, which Camparc doesn't
# track yet since it doesn't create ad sets (that's where an optimization
# goal actually lives). This picks the common commerce/lead action types as
# a reasonable default so a first sync produces something sensible; refining
# it per-objective is a natural follow-up once real ad sets exist.
CONVERSION_ACTION_TYPES = {"purchase", "lead", "complete_registration", "submit_application"}


def _sum_actions(actions: list[dict] | None, types: set[str]) -> float:
    if not actions:
        return 0.0
    return sum(float(a["value"]) for a in actions if a.get("action_type") in types)


async def get_campaign_insights(access_token: str, meta_campaign_id: str, since: str, until: str) -> list[dict]:
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.get(f"{GRAPH_BASE}/{meta_campaign_id}/insights", params={
            "fields": "spend,impressions,clicks,ctr,cpc,actions,action_values",
            # Daily breakdown rather than one summed total — campaign_performance
            # is keyed by (campaign_id, date), so this maps directly onto it.
            "time_increment": "1",
            "time_range": json.dumps({"since": since, "until": until}),
            "access_token": access_token,
        })
    data = resp.json()
    if resp.status_code != 200:
        raise MetaAPIError(_error_message(data, "Failed to fetch performance data from Meta"), resp.status_code)

    # Meta simply omits days with zero delivery rather than returning
    # zero-filled rows for them — a paused/undelivered campaign (like a test
    # account) can legitimately come back with an empty data list. That's a
    # correct "nothing happened yet" result, not an error.
    rows = []
    for r in data.get("data", []):
        spend = float(r.get("spend", 0) or 0)
        conversions = _sum_actions(r.get("actions"), CONVERSION_ACTION_TYPES)
        revenue = _sum_actions(r.get("action_values"), {"purchase"})
        rows.append({
            "date": r["date_start"],
            "spend": spend,
            "impressions": int(float(r.get("impressions", 0) or 0)),
            "clicks": int(float(r.get("clicks", 0) or 0)),
            "conversions": conversions,
            "revenue": revenue,
            "ctr": float(r.get("ctr", 0) or 0),
            "cpc": float(r.get("cpc", 0) or 0),
            "cpa": round(spend / conversions, 2) if conversions else None,
            "roas": round(revenue / spend, 2) if spend else None,
        })
    return rows
