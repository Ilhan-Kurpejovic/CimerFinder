from __future__ import annotations

from fastapi import APIRouter

from app.media.api.media import router as media_router

router = APIRouter(tags=["Images"])
router.include_router(media_router, prefix="/media")
