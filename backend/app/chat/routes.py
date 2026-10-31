from __future__ import annotations

from fastapi import APIRouter

from app.chat.api.chat import router as chat_router

router = APIRouter(tags=["Chat"])
router.include_router(chat_router, prefix="/conversations")
