import json

import httpx

from src.config import settings

GRAPH_BASE = f"https://graph.facebook.com/{settings.meta_api_version}"
DIALOG_BASE = f"https://www.facebook.com/{settings.meta_api_version}/dialog/oauth"

# Minimum scopes needed to read ad accounts and eventually manage campaigns.
# Requesting anything broader than this just adds friction to Meta's app review.
# pages_show_list was added so Camparc can list the Facebook Pages a user
# manages — every Meta ad must be attributed to a Page, a hard platform rule.
# Anyone who connected before this was added will need to reconnect once to
# grant it; Meta doesn't retroactively add scopes to an existing token.
SCOPES = ["ads_management", "ads_read", "business_management", "pages_show_list"]


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


async def list_pages(access_token: str) -> list[dict]:
    # Every Meta ad's creative must be attributed to a Facebook Page —
    # this lists the Pages the connected user actually manages so Camparc
    # can offer a picker instead of asking for a raw Page ID.
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(f"{GRAPH_BASE}/me/accounts", params={
            "fields": "id,name",
            "access_token": access_token,
        })
    data = resp.json()
    if resp.status_code != 200:
        raise MetaAPIError(_error_message(data, "Failed to fetch Facebook Pages"), resp.status_code)
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

# An ad set's optimization_goal tells Meta what to actually optimize delivery
# for, and has to be compatible with the campaign's objective above. The
# "correct" goals for OUTCOME_SALES (OFFSITE_CONVERSIONS) and OUTCOME_LEADS
# (LEAD_GENERATION) both require infrastructure Camparc doesn't manage yet —
# a Meta Pixel/Conversions API for the former, an on-platform Instant Form
# for the latter — so both fall back to LINK_CLICKS, which is always valid
# and simply optimizes for clicks instead of the deeper outcome until that
# infrastructure exists.
OPTIMIZATION_GOAL_MAP = {
    "awareness": "REACH",
    "consideration": "POST_ENGAGEMENT",
    "conversion": "LINK_CLICKS",
    "retention": "POST_ENGAGEMENT",
    "traffic": "LINK_CLICKS",
    "leads": "LINK_CLICKS",
}

# Small, safe subset of Meta's call-to-action enum — enough variety for a
# link ad without exposing the dozens of niche values (event responses,
# app-install variants, etc.) most workspaces will never need.
CALL_TO_ACTION_TYPES = ["LEARN_MORE", "SHOP_NOW", "SIGN_UP", "CONTACT_US", "DOWNLOAD", "SUBSCRIBE"]


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
        # A campaign that owns its own budget also has to declare how Meta
        # should bid with it. Leaving this unset let Meta silently default to
        # a capped strategy ("Bid cap") that then requires a manual
        # bid_amount nothing in Camparc collects — surfacing as "Invalid
        # parameter" on the *ad set* later, far from this actual cause.
        # LOWEST_COST_WITHOUT_CAP is Meta's own "automatic bidding" default
        # (shown as "Highest volume" in Ads Manager) — no bid amount needed.
        params["bid_strategy"] = "LOWEST_COST_WITHOUT_CAP"
    elif lifetime_budget_cents is not None:
        params["lifetime_budget"] = lifetime_budget_cents
        params["bid_strategy"] = "LOWEST_COST_WITHOUT_CAP"
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


async def create_ad_set(
    access_token: str,
    ad_account_id: str,
    campaign_id: str,
    name: str,
    optimization_goal: str,
    countries: list[str],
    age_min: int = 18,
    age_max: int = 65,
    daily_budget_cents: int | None = None,
) -> dict:
    account = ad_account_id if ad_account_id.startswith("act_") else f"act_{ad_account_id}"
    targeting = {
        "geo_locations": {"countries": countries or ["US"]},
        "age_min": age_min,
        "age_max": age_max,
        # Advantage+ audience lets Meta automatically expand delivery beyond
        # this baseline (interests, behaviors, placements) rather than
        # Camparc building a full targeting builder for v1.
        "targeting_automation": {"advantage_audience": 1},
    }
    params = {
        "name": name,
        "campaign_id": campaign_id,
        "optimization_goal": optimization_goal,
        "billing_event": "IMPRESSIONS",
        "targeting": json.dumps(targeting),
        # Paused for the same reason campaigns are: nothing spends until a
        # human explicitly activates it.
        "status": "PAUSED",
        "access_token": access_token,
    }
    # Only needed when the parent campaign has no budget of its own (i.e.
    # Campaign Budget Optimization wasn't used at deploy time) — passing a
    # budget here too when the campaign already has one is what Meta rejects
    # with the is_adset_budget_sharing_enabled error from Phase 2.
    if daily_budget_cents is not None:
        params["daily_budget"] = daily_budget_cents
        # Same reasoning as the campaign-level case in create_campaign():
        # whoever owns the budget also has to declare a bid_strategy, or
        # Meta defaults to a capped strategy that then demands a manual
        # bid_amount. Here the ad set owns the budget, so it owns this too.
        params["bid_strategy"] = "LOWEST_COST_WITHOUT_CAP"

    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(f"{GRAPH_BASE}/{account}/adsets", params=params)
    data = resp.json()
    if resp.status_code != 200 or "id" not in data:
        raise MetaAPIError(_error_message(data, "Failed to create ad set on Meta"), resp.status_code)
    return data


async def upload_image_bytes(access_token: str, ad_account_id: str, filename: str, content: bytes, content_type: str = "image/jpeg") -> str:
    # Uploads the actual image bytes to Meta rather than handing Meta a URL
    # to fetch. That matters because Camparc's own asset URLs are only
    # reachable at http://localhost in local/dev environments — Meta's
    # servers can never fetch those. Uploading bytes directly works
    # regardless of whether Camparc's assets are publicly hosted anywhere.
    account = ad_account_id if ad_account_id.startswith("act_") else f"act_{ad_account_id}"
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"{GRAPH_BASE}/{account}/adimages",
            params={"access_token": access_token},
            files={"file": (filename, content, content_type)},
        )
    data = resp.json()
    images = data.get("images", {})
    match = next(iter(images.values()), None)
    if resp.status_code != 200 or not match or "hash" not in match:
        raise MetaAPIError(_error_message(data, "Failed to upload image to Meta"), resp.status_code)
    return match["hash"]


async def create_ad_creative(
    access_token: str,
    ad_account_id: str,
    page_id: str,
    image_hash: str,
    headline: str,
    primary_text: str,
    link_url: str,
    call_to_action: str,
    name: str,
) -> dict:
    account = ad_account_id if ad_account_id.startswith("act_") else f"act_{ad_account_id}"
    object_story_spec = {
        # Hard Meta requirement: every ad creative renders "from" a Page.
        "page_id": page_id,
        "link_data": {
            "image_hash": image_hash,
            "link": link_url,
            "message": primary_text,
            "name": headline,
            "call_to_action": {"type": call_to_action, "value": {"link": link_url}},
        },
    }
    params = {
        "name": name,
        "object_story_spec": json.dumps(object_story_spec),
        "access_token": access_token,
    }
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(f"{GRAPH_BASE}/{account}/adcreatives", params=params)
    data = resp.json()
    if resp.status_code != 200 or "id" not in data:
        raise MetaAPIError(_error_message(data, "Failed to create ad creative on Meta"), resp.status_code)
    return data


async def create_ad(access_token: str, ad_account_id: str, ad_set_id: str, creative_id: str, name: str) -> dict:
    account = ad_account_id if ad_account_id.startswith("act_") else f"act_{ad_account_id}"
    params = {
        "name": name,
        "adset_id": ad_set_id,
        "creative": json.dumps({"creative_id": creative_id}),
        "status": "PAUSED",
        "access_token": access_token,
    }
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(f"{GRAPH_BASE}/{account}/ads", params=params)
    data = resp.json()
    if resp.status_code != 200 or "id" not in data:
        raise MetaAPIError(_error_message(data, "Failed to create ad on Meta"), resp.status_code)
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
