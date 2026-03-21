from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError
from loguru import logger
from app.core.config import database

def init_async_url():    
    user = database.username
    password = database.password
    host = database.host
    port = database.port
    db_name = database.name

    return f'postgresql+asyncpg://{user}:{password}@{host}:{port}/{db_name}'

def init_url():    
    user = database.username
    password = database.password
    host = database.host
    port = database.port
    db_name = database.name
    
    return f'postgresql+psycopg2://{user}:{password}@{host}:{port}/{db_name}'


def ensure_database_exists() -> bool:
    """Create the configured Postgres database if it does not exist."""
    target_url = make_url(init_url())
    db_name = target_url.database

    if not db_name:
        logger.warning("Database name is empty; skipping database auto-create")
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
    """Return True if an OperationalError indicates a missing configured database."""
    missing_db_msg = f'database "{database.name}" does not exist'
    return missing_db_msg in str(error)

async_engine = create_async_engine(
    init_async_url(),
    pool_size = 20,
    max_overflow = 30,
    pool_pre_ping = True
)
AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_= AsyncSession,
    expire_on_commit=False
)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
        
sync_engine = create_engine(init_url())
SyncSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=sync_engine
    )

def get_sync_db():
    db = SyncSessionLocal()
    try:
        yield db
    finally:
        db.close()
