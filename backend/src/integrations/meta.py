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
        raise MetaAPIError(
            data.get("error", {}).get("message", "Failed to exchange code for token"),
            resp.status_code,
        )
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
        raise MetaAPIError(
            data.get("error", {}).get("message", "Failed to exchange for a long-lived token"),
            resp.status_code,
        )
    return data


async def get_ad_accounts(access_token: str) -> list[dict]:
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(f"{GRAPH_BASE}/me/adaccounts", params={
            "fields": "id,name,account_status,currency,timezone_name",
            "access_token": access_token,
        })
    data = resp.json()
    if resp.status_code != 200:
        raise MetaAPIError(
            data.get("error", {}).get("message", "Failed to fetch ad accounts"),
            resp.status_code,
        )
    return data.get("data", [])
