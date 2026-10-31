from __future__ import annotations

from datetime import datetime
from enum import StrEnum
from typing import TYPE_CHECKING

from sqlalchemy import (
    JSON,
    TIMESTAMP,
    Boolean,
    CheckConstraint,
    ForeignKey,
    Numeric,
    String,
    Text,
    false,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

if TYPE_CHECKING:
    from app.listings.models.photo import ListingPhoto
    from app.users.models.user import User


class ListingKind(StrEnum):
    ROOM = "room"
    ROOMMATE = "roommate"


class ListingStatus(StrEnum):
    ACTIVE = "active"
    PAUSED = "paused"
    MATCHED = "matched"


class Listing(Base):
    __tablename__ = "listings"
    __table_args__ = (
        CheckConstraint("status IN ('active', 'paused', 'matched')", name="status_known"),
        CheckConstraint("kind IN ('room', 'roommate')", name="kind_known"),
        CheckConstraint("length(trim(title)) BETWEEN 8 AND 90", name="title_length"),
        CheckConstraint("length(trim(description)) BETWEEN 40 AND 3000", name="description_length"),
        CheckConstraint("length(trim(city)) BETWEEN 2 AND 80", name="city_length"),
        CheckConstraint("length(trim(neighborhood)) BETWEEN 2 AND 100", name="neighborhood_length"),
        CheckConstraint("price >= 1 AND price <= 5000", name="price_range"),
        CheckConstraint("area >= 1 AND area <= 500", name="area_range"),
        CheckConstraint("roommates >= 1 AND roommates <= 10", name="roommates_range"),
        {"sqlite_autoincrement": True},
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    kind: Mapped[str] = mapped_column(String(20), index=True)
    status: Mapped[str] = mapped_column(
        String(16), default=ListingStatus.ACTIVE, server_default="active", index=True
    )
    title: Mapped[str] = mapped_column(String(90))
    description: Mapped[str] = mapped_column(Text)
    city: Mapped[str] = mapped_column(String(80), index=True)
    neighborhood: Mapped[str] = mapped_column(String(100))
    price: Mapped[float] = mapped_column(Numeric(10, 2, asdecimal=False), index=True)
    area: Mapped[int] = mapped_column()
    roommates: Mapped[int] = mapped_column()
    tags: Mapped[list[str]] = mapped_column(JSON, default=list)
    pet_friendly: Mapped[bool] = mapped_column(Boolean, default=False, server_default=false())
    image_url: Mapped[str | None] = mapped_column(String(500), default=None)
    search_text: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now(), index=True
    )
    owner: Mapped[User] = relationship("User")
    photos: Mapped[list[ListingPhoto]] = relationship(
        "ListingPhoto",
        order_by="ListingPhoto.position",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    @property
    def image_urls(self) -> list[str]:
        return (
            [photo.url for photo in self.photos]
            if self.photos
            else ([self.image_url] if self.image_url else [])
        )
