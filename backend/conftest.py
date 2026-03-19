import asyncio
import os
import socket
import uuid
from collections.abc import AsyncGenerator, Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import NullPool

from app.auth.jwt_utils import get_current_user
from app.core.config import database
from app.main import app
from db.core import get_db
from db.models import Base, Users


def _resolve_test_db_host() -> str:
    override_host = os.getenv("TEST_DB_HOST")
    if override_host:
        return override_host

    for candidate in (database.host, "localhost", "127.0.0.1"):
        try:
            socket.getaddrinfo(candidate, None)
            return candidate
        except socket.gaierror:
            continue

    return database.host


@pytest.fixture(scope="session")
def test_database_name() -> str:
    return f"{database.name}_test"


@pytest.fixture(scope="session")
def test_database_setup(test_database_name: str) -> Generator[dict[str, object], None, None]:
    test_db_host = _resolve_test_db_host()

    admin_url = URL.create(
        drivername="postgresql+psycopg2",
        username=database.username,
        password=database.password,
        host=test_db_host,
        port=database.port,
        database="postgres",
    )
    admin_engine = create_engine(admin_url, isolation_level="AUTOCOMMIT")

    with admin_engine.connect() as connection:
        connection.execute(
            text(
                "SELECT pg_terminate_backend(pid) "
                "FROM pg_stat_activity "
                "WHERE datname = :database_name AND pid <> pg_backend_pid()"
            ),
            {"database_name": test_database_name},
        )
        connection.execute(text(f'DROP DATABASE IF EXISTS "{test_database_name}"'))
        connection.execute(text(f'CREATE DATABASE "{test_database_name}"'))

    test_sync_url = URL.create(
        drivername="postgresql+psycopg2",
        username=database.username,
        password=database.password,
        host=test_db_host,
        port=database.port,
        database=test_database_name,
    )

    test_async_url = URL.create(
        drivername="postgresql+asyncpg",
        username=database.username,
        password=database.password,
        host=test_db_host,
        port=database.port,
        database=test_database_name,
    )

    sync_engine = create_engine(test_sync_url)
    Base.metadata.create_all(bind=sync_engine)

    async_engine = create_async_engine(test_async_url, poolclass=NullPool)
    async_session_factory = async_sessionmaker(bind=async_engine, class_=AsyncSession, expire_on_commit=False)
    sync_session_factory = sessionmaker(bind=sync_engine, class_=Session, expire_on_commit=False)

    try:
        yield {
            "async_session_factory": async_session_factory,
            "sync_session_factory": sync_session_factory,
        }
    finally:
        async def _dispose() -> None:
            await async_engine.dispose()

        asyncio.run(_dispose())
        sync_engine.dispose()

        with admin_engine.connect() as connection:
            connection.execute(
                text(
                    "SELECT pg_terminate_backend(pid) "
                    "FROM pg_stat_activity "
                    "WHERE datname = :database_name AND pid <> pg_backend_pid()"
                ),
                {"database_name": test_database_name},
            )
            connection.execute(text(f'DROP DATABASE IF EXISTS "{test_database_name}"'))

        admin_engine.dispose()


@pytest.fixture(scope="session")
def test_database_session_factory(test_database_setup: dict[str, object]) -> async_sessionmaker[AsyncSession]:
    return test_database_setup["async_session_factory"]


@pytest.fixture(scope="session")
def test_sync_session_factory(test_database_setup: dict[str, object]) -> sessionmaker[Session]:
    return test_database_setup["sync_session_factory"]


@pytest.fixture(scope="session")
def test_user(test_sync_session_factory: sessionmaker[Session]) -> dict[str, str]:
    user_data = {
        "email": "test-user@example.com",
        "display_name": "Test User",
    }

    with test_sync_session_factory() as session:
        user = Users(email=user_data["email"], display_name=user_data["display_name"])
        session.add(user)
        session.commit()
        session.refresh(user)
        user_data["id"] = str(user.id)

    return user_data


@pytest.fixture(scope="function")
def client(
    test_database_session_factory: async_sessionmaker[AsyncSession],
    test_user: dict[str, str],
) -> Generator[TestClient, None, None]:
    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        async with test_database_session_factory() as session:
            yield session

    async def override_get_current_user() -> Users:
        return Users(
            id=uuid.UUID(test_user["id"]),
            email=test_user["email"],
            display_name=test_user["display_name"],
        )

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_get_current_user

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
