from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import TIMESTAMP, CheckConstraint, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

if TYPE_CHECKING:
    from app.users.models.user import User


class Conversation(Base):
    __tablename__ = "conversations"
    __table_args__ = (
        UniqueConstraint("listing_id", "guest_id"),
        CheckConstraint("owner_id != guest_id", name="different_participants"),
        CheckConstraint("owner_read_id >= 0 AND guest_read_id >= 0", name="read_positions"),
        {"sqlite_autoincrement": True},
    )
    id: Mapped[int] = mapped_column(primary_key=True)
    listing_id: Mapped[int | None] = mapped_column(
        ForeignKey("listings.id", ondelete="SET NULL"), index=True
    )
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    guest_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    listing_title: Mapped[str] = mapped_column(String(90))
    owner_read_id: Mapped[int] = mapped_column(default=0, server_default="0")
    guest_read_id: Mapped[int] = mapped_column(default=0, server_default="0")
    last_message_id: Mapped[int] = mapped_column(default=0, server_default="0", index=True)
    last_message: Mapped[str] = mapped_column(String(2000), default="", server_default="")
    last_message_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now()
    )
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now()
    )
    owner: Mapped[User] = relationship("User", foreign_keys=[owner_id])
    guest: Mapped[User] = relationship("User", foreign_keys=[guest_id])
