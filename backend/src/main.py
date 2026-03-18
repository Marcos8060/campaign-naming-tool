from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
import os

from src.config import settings
from src.api.v1.router import api_router
from src.db.session import init_db, close_db
from src.core.limiter import limiter


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield
    await close_db()


app = FastAPI(
    title="Camparc",
    description="Multi-tenant B2B SaaS for campaign naming standardization and intelligence",
    version="1.0.0",
    lifespan=lifespan,
    # Hide docs in production
    docs_url=None if settings.is_production() else "/docs",
    redoc_url=None if settings.is_production() else "/redoc",
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

uploads_dir = "uploads"
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")


@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}
