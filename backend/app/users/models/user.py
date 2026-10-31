from __future__ import annotations

from datetime import datetime

from sqlalchemy import TIMESTAMP, CheckConstraint, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint("length(trim(display_name)) BETWEEN 2 AND 60", name="display_name_length"),
        CheckConstraint("age IS NULL OR (age >= 18 AND age <= 100)", name="age_range"),
        CheckConstraint("length(occupation) <= 100", name="occupation_length"),
        CheckConstraint("length(city) <= 80", name="city_length"),
        CheckConstraint("length(bio) <= 1000", name="bio_length"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(254), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(128))
    display_name: Mapped[str] = mapped_column(String(60))
    age: Mapped[int | None] = mapped_column(default=None)
    occupation: Mapped[str] = mapped_column(String(100), default="", server_default="")
    city: Mapped[str] = mapped_column(String(80), default="", server_default="")
    bio: Mapped[str] = mapped_column(Text, default="", server_default="")
    avatar_media_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "media.id", ondelete="RESTRICT", use_alter=True, name="fk_users_avatar_media_id_media"
        ),
        index=True,
        default=None,
    )
    avatar_url: Mapped[str | None] = mapped_column(String(500), default=None)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now()
    )
