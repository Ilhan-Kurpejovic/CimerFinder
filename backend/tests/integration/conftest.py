from __future__ import annotations

from collections.abc import Generator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import delete, select

from app.config.settings import DBSettings, Settings
from app.database.base import Base
from app.database.session_factory import ISessionFactory, SessionFactory
from app.listings.models.listing import Listing
from app.users.models.user import User
from app.utils.di import add_to_di_container, get_from_di_container

pytestmark = pytest.mark.integration


@pytest.fixture(scope="package")
def setup_db(tmp_path_factory: pytest.TempPathFactory) -> Generator[None]:
    previous_settings = get_from_di_container(Settings)
    previous_factory = get_from_di_container(ISessionFactory)
    db_file: Path = tmp_path_factory.mktemp("db") / "test.db"
    settings = previous_settings.model_copy(
        update={
            "DATABASE_URL": f"sqlite:///{db_file.as_posix()}",
            "UPLOAD_DIR": str(db_file.parent / "uploads"),
        }
    )
    factory = SessionFactory(settings)
    add_to_di_container(Settings, settings)
    add_to_di_container(DBSettings, settings)
    add_to_di_container(ISessionFactory, factory)
    yield
    factory.engine.dispose()
    add_to_di_container(Settings, previous_settings)
    add_to_di_container(DBSettings, previous_settings)
    add_to_di_container(ISessionFactory, previous_factory)


@pytest.fixture(scope="package", autouse=True)
def tables(setup_db: None) -> Generator[None]:  # noqa: ARG001
    factory = get_from_di_container(ISessionFactory)
    Base.metadata.create_all(bind=factory.engine)
    yield
    Base.metadata.drop_all(bind=factory.engine)


@pytest.fixture(autouse=True)
def clean_tables() -> Generator[None]:
    # Only this package's temporary test database is ever cleared.
    yield
    factory = get_from_di_container(ISessionFactory)
    with factory() as session:
        session.execute(delete(Listing))
        for user in session.scalars(select(User)):
            user.avatar_media_id = None
        session.flush()
        session.execute(delete(User))
        session.commit()


def register(client: TestClient, email: str) -> dict[str, str]:
    response = client.post(
        "/api/auth/register",
        json={"email": email, "password": "secret123", "displayName": email.split("@")[0]},
    )
    assert response.status_code == 201, response.text
    return {"Authorization": f"Bearer {response.json()['token']}"}


@pytest.fixture
def auth_headers(client: TestClient) -> dict[str, str]:
    return register(client, "ana@example.com")


@pytest.fixture
def other_auth_headers(client: TestClient) -> dict[str, str]:
    return register(client, "marko@example.com")


@pytest.fixture
def publisher_headers(client: TestClient, auth_headers: dict[str, str]) -> dict[str, str]:
    assert (
        client.patch(
            "/api/users/me", headers=auth_headers, json={"age": 24, "occupation": "Student"}
        ).status_code
        == 200
    )
    return auth_headers


@pytest.fixture
def listing_body() -> dict[str, object]:
    return {
        "kind": "room",
        "title": "Svijetla soba na Vračaru",
        "description": "Udobna soba u mirnom zajedničkom stanu, blizu prevoza i fakulteta.",
        "city": "Beograd",
        "neighborhood": "Vračar",
        "price": 280,
        "area": 18,
        "roommates": 2,
        "tags": ["Pet friendly", "Namješteno"],
        "imageUrl": "https://example.com/room.jpg",
    }


@pytest.fixture
def listing_id(
    client: TestClient, publisher_headers: dict[str, str], listing_body: dict[str, object]
) -> int:
    response = client.post("/api/listings", headers=publisher_headers, json=listing_body)
    assert response.status_code == 201, response.text
    return int(response.json()["id"])
