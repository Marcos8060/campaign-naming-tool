"""
Shared pytest fixtures.

Uses httpx.AsyncClient against the FastAPI app with a fully mocked
asyncpg pool so tests run without a real database.
"""
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from src.core.security import create_access_token, hash_password
from src.main import app

# ── Helpers ──────────────────────────────────────────────────────────────────

WORKSPACE_ID = str(uuid4())
USER_ID       = str(uuid4())
ADMIN_TOKEN   = create_access_token({"user_id": USER_ID, "workspace_id": WORKSPACE_ID, "role": "admin"})
VIEWER_TOKEN  = create_access_token({"user_id": str(uuid4()), "workspace_id": WORKSPACE_ID, "role": "viewer"})


def make_user(role: str = "admin", **kwargs) -> dict:
    return {
        "id": USER_ID,
        "workspace_id": WORKSPACE_ID,
        "email": "test@example.com",
        "name": "Test User",
        "role": role,
        "is_active": True,
        "password_hash": hash_password("TestPass123"),
        "last_login_at": None,
        "created_at": None,
        "updated_at": None,
        **kwargs,
    }


def make_workspace(**kwargs) -> dict:
    return {
        "id": WORKSPACE_ID,
        "name": "Test Workspace",
        "slug": "test-workspace",
        "settings": {},
        "is_active": True,
        "created_at": None,
        "updated_at": None,
        **kwargs,
    }


def make_refresh_token_record(**kwargs) -> dict:
    from datetime import datetime, timedelta
    return {
        "id": str(uuid4()),
        "user_id": USER_ID,
        "expires_at": datetime.utcnow() + timedelta(days=7),
        "revoked_at": None,
        **kwargs,
    }


def make_campaign(**kwargs) -> dict:
    return {
        "id": str(uuid4()),
        "workspace_id": WORKSPACE_ID,
        "name": "TEST_BRAND_NA_AWARE_2024",
        "platform": "meta",
        "platform_id": None,
        "objective": "awareness",
        "budget_total": 10000,
        "budget_daily": 500,
        "start_date": "2024-01-01",
        "end_date": None,
        "status": "draft",
        "taxonomy_values": {},
        "configuration": {},
        "created_by": USER_ID,
        "created_at": None,
        "updated_at": None,
        **kwargs,
    }


# ── Pool mock factory ─────────────────────────────────────────────────────────

def build_mock_pool(**overrides):
    """Return a mock asyncpg pool with sensible defaults."""
    pool = MagicMock()
    pool.fetch = AsyncMock(return_value=[])
    pool.fetchrow = AsyncMock(return_value=None)
    pool.execute = AsyncMock(return_value="UPDATE 1")
    pool.fetchval = AsyncMock(return_value=None)

    conn = AsyncMock()
    conn.transaction = MagicMock(return_value=_AsyncContextManager(AsyncMock()))
    conn.fetchrow = AsyncMock(return_value=None)
    conn.execute = AsyncMock(return_value="OK")
    conn.fetch = AsyncMock(return_value=[])

    pool.acquire = MagicMock(return_value=_AsyncContextManager(conn))
    pool._conn = conn  # expose for per-test overrides

    for k, v in overrides.items():
        setattr(pool, k, v)
    return pool


class _AsyncContextManager:
    """Tiny helper to make MagicMock work as `async with`."""
    def __init__(self, value):
        self._value = value

    async def __aenter__(self):
        return self._value

    async def __aexit__(self, *_):
        pass


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest_asyncio.fixture
async def client():
    """ASGI test client with a clean mock pool."""
    mock_pool = build_mock_pool()
    with patch("src.db.session.get_pool", return_value=mock_pool), \
         patch("src.db.session.pool", mock_pool):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as ac:
            yield ac, mock_pool


@pytest.fixture
def auth_cookies():
    # Auth now travels as an httpOnly cookie (see api/deps.py's Cookie-based
    # get_current_user), not an Authorization header — mirror that here so
    # these fixtures actually exercise the real auth path.
    return {"access_token": ADMIN_TOKEN}


@pytest.fixture
def viewer_cookies():
    return {"access_token": VIEWER_TOKEN}


@pytest.fixture
def mock_pool():
    return build_mock_pool()
