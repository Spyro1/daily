from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
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
