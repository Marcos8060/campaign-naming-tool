import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from src.api.v1.router import api_router
from src.config import settings
from src.core.limiter import limiter
from src.db.session import close_db, init_db
from src.services.scheduler import start_scheduler, stop_scheduler

# Without this, Python's root logger defaults to WARNING — every
# logger.info() call in the app (scheduler status, sync results, etc.)
# would be silently dropped instead of showing up in `docker logs`.
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    start_scheduler()
    yield
    stop_scheduler()
    await close_db()


app = FastAPI(
    title="Camparc",
    description="Multi-tenant B2B SaaS for campaign naming standardization and intelligence",
    version="1.0.0",
    lifespan=lifespan,
    docs_url=None if settings.is_production() else "/docs",
    redoc_url=None if settings.is_production() else "/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global default (200/minute/IP, see src/core/limiter.py) plus tighter
# per-route limits on the auth endpoints most worth protecting from
# brute-force/abuse (login, register, password reset). Routes without
# an explicit @limiter.limit(...) just inherit the global default.
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.include_router(api_router, prefix="/api/v1")

uploads_dir = "uploads"
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")


@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}
