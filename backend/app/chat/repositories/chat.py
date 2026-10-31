from __future__ import annotations

from typing import Protocol

from sqlalchemy import case, func, insert, literal, or_, select, update
from sqlalchemy.orm import joinedload

from app.chat.models.conversation import Conversation
from app.chat.models.message import Message
from app.database.session_factory import ISessionFactory
from app.listings.models.listing import Listing
from app.utils.di import inject
from app.utils.pagination import Page, PaginationParams, paginate


class IChatRepository(Protocol):
    def get(self, conversation_id: int) -> Conversation | None: ...
    def ensure(self, listing: Listing, guest_id: int) -> Conversation: ...
    def conversations(self, user_id: int, pagination: PaginationParams) -> Page[Conversation]: ...
    def unread(self, user_id: int, ids: list[int] | None = None) -> dict[int, int]: ...
    def history(self, conversation_id: int, before_id: int | None, size: int) -> list[Message]: ...
    def message(self, message_id: int) -> Message | None: ...
    def by_client(self, sender_id: int, client_id: str) -> Message | None: ...
    def send(
        self, conversation: Conversation, user_id: int, body: str, client_id: str
    ) -> Message: ...
    def read(self, conversation: Conversation, user_id: int, through_id: int) -> None: ...


@inject(alias=IChatRepository)
class ChatRepository(IChatRepository):
    def __init__(self, session_factory: ISessionFactory) -> None:
        self._factory = session_factory

    def get(self, conversation_id: int) -> Conversation | None:
        return self._factory().scalar(
            select(Conversation)
            .where(Conversation.id == conversation_id)
            .options(joinedload(Conversation.owner), joinedload(Conversation.guest))
        )

    def ensure(self, listing: Listing, guest_id: int) -> Conversation:
        session = self._factory()
        exists = (
            select(Conversation.id)
            .where(Conversation.listing_id == listing.id, Conversation.guest_id == guest_id)
            .exists()
        )
        session.execute(
            insert(Conversation).from_select(
                ["listing_id", "owner_id", "guest_id", "listing_title"],
                select(
                    literal(listing.id),
                    literal(listing.owner_id),
                    literal(guest_id),
                    literal(listing.title),
                ).where(~exists),
            )
        )
        item = session.scalar(
            select(Conversation)
            .where(Conversation.listing_id == listing.id, Conversation.guest_id == guest_id)
            .options(joinedload(Conversation.owner), joinedload(Conversation.guest))
        )
        assert item is not None
        return item

    def conversations(self, user_id: int, pagination: PaginationParams) -> Page[Conversation]:
        query = (
            select(Conversation)
            .where(or_(Conversation.owner_id == user_id, Conversation.guest_id == user_id))
            .options(joinedload(Conversation.owner), joinedload(Conversation.guest))
            .order_by(Conversation.last_message_id.desc(), Conversation.id.desc())
        )
        return paginate(query, pagination, self._factory())

    def unread(self, user_id: int, ids: list[int] | None = None) -> dict[int, int]:
        position = case(
            (Conversation.owner_id == user_id, Conversation.owner_read_id),
            else_=Conversation.guest_read_id,
        )
        query = (
            select(Conversation.id, func.count(Message.id))
            .join(Message, Message.conversation_id == Conversation.id)
            .where(
                or_(Conversation.owner_id == user_id, Conversation.guest_id == user_id),
                Message.sender_id != user_id,
                Message.id > position,
            )
            .group_by(Conversation.id)
        )
        if ids is not None:
            query = query.where(Conversation.id.in_(ids))
        return {int(row[0]): int(row[1]) for row in self._factory().execute(query)}

    def history(self, conversation_id: int, before_id: int | None, size: int) -> list[Message]:
        query = select(Message).where(Message.conversation_id == conversation_id)
        if before_id is not None:
            query = query.where(Message.id < before_id)
        return list(self._factory().scalars(query.order_by(Message.id.desc()).limit(size + 1)))

    def message(self, message_id: int) -> Message | None:
        return self._factory().get(Message, message_id)

    def by_client(self, sender_id: int, client_id: str) -> Message | None:
        return self._factory().scalar(
            select(Message).where(Message.sender_id == sender_id, Message.client_id == client_id)
        )

    def send(self, conversation: Conversation, user_id: int, body: str, client_id: str) -> Message:
        session = self._factory()
        exists = (
            select(Message.id)
            .where(Message.sender_id == user_id, Message.client_id == client_id)
            .exists()
        )
        session.execute(
            insert(Message).from_select(
                ["conversation_id", "sender_id", "body", "client_id"],
                select(
                    literal(conversation.id), literal(user_id), literal(body), literal(client_id)
                ).where(~exists),
            )
        )
        item = self.by_client(user_id, client_id)
        assert item is not None
        session.execute(
            update(Conversation)
            .where(Conversation.id == conversation.id, Conversation.last_message_id < item.id)
            .values(
                last_message_id=item.id, last_message=item.body, last_message_at=item.created_at
            )
        )
        session.flush()
        return item

    def read(self, conversation: Conversation, user_id: int, through_id: int) -> None:
        session = self._factory()
        column = (
            Conversation.owner_read_id
            if conversation.owner_id == user_id
            else Conversation.guest_read_id
        )
        session.execute(
            update(Conversation)
            .where(Conversation.id == conversation.id, column < through_id)
            .values({column: through_id})
        )
        session.flush()
