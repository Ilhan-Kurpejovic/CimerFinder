from __future__ import annotations

from fastapi import APIRouter

from app.auth.routes import router as auth_router
from app.chat.routes import router as chat_router
from app.favorites.routes import router as favorites_router
from app.listings.routes import router as listings_router
from app.media.routes import router as media_router
from app.users.routes import router as users_router

api_router = APIRouter(prefix="/api")
api_router.include_router(auth_router)
api_router.include_router(users_router)

api_router.include_router(listings_router)

api_router.include_router(media_router)

api_router.include_router(favorites_router)

api_router.include_router(chat_router)
