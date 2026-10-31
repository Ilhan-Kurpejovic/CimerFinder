from __future__ import annotations

from datetime import datetime
from enum import StrEnum

from sqlalchemy import TIMESTAMP, CheckConstraint, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class MediaPurpose(StrEnum):
    AVATAR = "avatar"
    LISTING = "listing"


class Media(Base):
    __tablename__ = "media"
    __table_args__ = (
        CheckConstraint("purpose IN ('avatar', 'listing')", name="purpose_known"),
        CheckConstraint("byte_size > 0 AND width > 0 AND height > 0", name="positive_dimensions"),
        {"sqlite_autoincrement": True},
    )
    id: Mapped[int] = mapped_column(primary_key=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    storage_key: Mapped[str] = mapped_column(String(37), unique=True)
    purpose: Mapped[str] = mapped_column(String(16))
    byte_size: Mapped[int] = mapped_column()
    width: Mapped[int] = mapped_column()
    height: Mapped[int] = mapped_column()
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now()
    )

    @property
    def url(self) -> str:
        return f"/api/media/{self.storage_key}"
