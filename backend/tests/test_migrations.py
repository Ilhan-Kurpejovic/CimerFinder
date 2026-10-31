from __future__ import annotations

from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, inspect


def test_fresh_database_matches_models(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    url = f"sqlite:///{(tmp_path / 'migrations.db').as_posix()}"
    monkeypatch.setenv("DATABASE_URL", url)
    config = Config("alembic.ini")
    command.upgrade(config, "head")
    engine = create_engine(url)
    try:
        inspector = inspect(engine)
        assert "users" in inspector.get_table_names()
        columns = {column["name"] for column in inspector.get_columns("users")}
        assert {
            "id",
            "email",
            "password_hash",
            "display_name",
            "age",
            "occupation",
            "city",
            "bio",
            "avatar_url",
        } <= columns
        command.check(config)
    finally:
        engine.dispose()


def test_upgrade_preserves_phase_one_users(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    from sqlalchemy import insert, select

    from app.users.models.user import User

    url = f"sqlite:///{(tmp_path / 'upgrade.db').as_posix()}"
    monkeypatch.setenv("DATABASE_URL", url)
    config = Config("alembic.ini")
    command.upgrade(config, "eec0b6ae300b")
    engine = create_engine(url)
    try:
        with engine.begin() as connection:
            connection.execute(
                insert(User).values(
                    email="existing@example.com",
                    password_hash="migration-fixture-not-a-password",
                    display_name="Existing user",
                )
            )
        command.upgrade(config, "head")
        with engine.connect() as connection:
            assert connection.scalar(select(User.email)) == "existing@example.com"
        assert "listings" in inspect(engine).get_table_names()
    finally:
        engine.dispose()


def test_photo_upgrade_preserves_existing_users_and_listings(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    from sqlalchemy import text

    url = f"sqlite:///{(tmp_path / 'photos-upgrade.db').as_posix()}"
    monkeypatch.setenv("DATABASE_URL", url)
    config = Config("alembic.ini")
    command.upgrade(config, "830842546958")
    engine = create_engine(url)
    try:
        with engine.begin() as connection:
            connection.execute(
                text(
                    "INSERT INTO users (id,email,password_hash,display_name,occupation,city,bio,avatar_url) VALUES (1,'legacy@example.com','test-hash','Existing user','','','','https://example.com/avatar.jpg')"
                )
            )
            connection.execute(
                text(
                    "INSERT INTO listings (id,owner_id,kind,title,description,city,neighborhood,price,area,roommates,tags,image_url,search_text,pet_friendly) VALUES (1,1,'room','Existing room','Legacy description with enough detail about the room and shared home.','Beograd','Centar',200,20,1,'[]','https://example.com/room.jpg','existing room',0)"
                )
            )
        command.upgrade(config, "7a20970e2041")
        with engine.begin() as connection:
            connection.execute(text("INSERT INTO favorites (user_id,listing_id) VALUES (1,1)"))
            connection.execute(
                text(
                    "INSERT INTO listing_photos (listing_id,url,position) VALUES (1,'https://example.com/room.jpg',0)"
                )
            )
        command.upgrade(config, "head")
        with engine.connect() as connection:
            assert (
                connection.scalar(text("SELECT email FROM users WHERE id=1"))
                == "legacy@example.com"
            )
            assert (
                connection.scalar(text("SELECT avatar_url FROM users WHERE id=1"))
                == "https://example.com/avatar.jpg"
            )
            assert (
                connection.scalar(text("SELECT image_url FROM listings WHERE id=1"))
                == "https://example.com/room.jpg"
            )
            assert connection.scalar(text("SELECT status FROM listings WHERE id=1")) == "active"
            assert connection.scalar(text("SELECT count(*) FROM favorites")) == 1
            assert connection.scalar(text("SELECT count(*) FROM listing_photos")) == 1
            assert not connection.execute(text("PRAGMA foreign_key_check")).fetchall()
        assert {"media", "listing_photos"} <= set(inspect(engine).get_table_names())
        command.check(config)
    finally:
        engine.dispose()
