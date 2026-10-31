from __future__ import annotations

import logging
from collections.abc import Callable
from typing import Literal, cast

from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


def on_transaction(
    session: Session, event: Literal["commit", "rollback"], action: Callable[[], None]
) -> None:
    session.info.setdefault(f"after_{event}", []).append(action)


def finish_transaction(session: Session, event: Literal["commit", "rollback"]) -> None:
    actions = cast(list[Callable[[], None]], session.info.pop(f"after_{event}", []))
    other = "rollback" if event == "commit" else "commit"
    session.info.pop(f"after_{other}", None)
    for action in actions:
        try:
            action()
        except OSError:
            logger.exception("Deferred file cleanup failed; database state was preserved")
