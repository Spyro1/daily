"""Database engine, session factories, and connection helpers."""

from collections.abc import AsyncGenerator

from loguru import logger
from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL, make_url
from sqlalchemy.exc import OperationalError
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import database


# ─── URL builders ────────────────────────────────────────────────────

def _build_url(driver: str) -> URL:
    return URL.create(
        drivername=driver,
        username=database.username,
        password=database.password,
        host=database.host,
        port=database.port,
        database=database.name,
    )


# ─── Database auto-creation ─────────────────────────────────────────

def ensure_database_exists() -> bool:
    """Create the configured Postgres database if it does not exist."""
    target_url = _build_url("postgresql+psycopg2")
    db_name = target_url.database

    if not db_name:
        logger.warning("Database name is empty — skipping database auto-create")
        return False

    admin_url = target_url.set(database="postgres")
    admin_engine = create_engine(admin_url, isolation_level="AUTOCOMMIT")

    try:
        with admin_engine.connect() as conn:
            exists = conn.execute(
                text("SELECT 1 FROM pg_database WHERE datname = :db_name"),
                {"db_name": db_name},
            ).scalar()

            if exists:
                return False

            safe_db_name = db_name.replace('"', '""')
            conn.exec_driver_sql(f'CREATE DATABASE "{safe_db_name}"')
            logger.info(f'Created missing database: "{db_name}"')
            return True
    finally:
        admin_engine.dispose()


def should_create_database_for_error(error: OperationalError) -> bool:
    """Return ``True`` if an ``OperationalError`` indicates a missing database."""
    return f'database "{database.name}" does not exist' in str(error)


# ─── Async engine / session (used by the app) ───────────────────────

async_engine = create_async_engine(
    _build_url("postgresql+asyncpg"),
    pool_size=20,
    max_overflow=30,
    pool_pre_ping=True,
)

AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session


# ─── Sync engine / session (used by seed scripts) ───────────────────

sync_engine = create_engine(_build_url("postgresql+psycopg2"))

SyncSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=sync_engine,
)


def get_sync_db():
    db = SyncSessionLocal()
    try:
        yield db
    finally:
        db.close()
