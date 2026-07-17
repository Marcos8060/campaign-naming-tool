from fastapi import APIRouter
from src.api.v1.endpoints import auth, workspaces, users, taxonomies, campaigns, analytics, platforms, exports, assets, branding, health, integrations, ad_sets

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(workspaces.router, prefix="/workspaces", tags=["workspaces"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(taxonomies.router, prefix="/taxonomies", tags=["taxonomies"])
api_router.include_router(campaigns.router, prefix="/campaigns", tags=["campaigns"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(platforms.router, prefix="/platforms", tags=["platforms"])
api_router.include_router(exports.router, prefix="/exports", tags=["exports"])
api_router.include_router(assets.router, prefix="/assets", tags=["assets"])
api_router.include_router(branding.router, prefix="/branding", tags=["branding"])
api_router.include_router(integrations.router, prefix="/integrations", tags=["integrations"])
api_router.include_router(ad_sets.router, prefix="/ad-sets", tags=["ad-sets"])
