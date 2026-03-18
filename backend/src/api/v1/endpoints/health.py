from fastapi import APIRouter
from src.db.session import get_pool

router = APIRouter()


@router.get("")
async def health():
    return {"status": "healthy"}
