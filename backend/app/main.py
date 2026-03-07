import asyncio
import uvicorn
from alembic import command
from alembic.config import Config
from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
# from fastapi.openapi.utils import get_openapi

from core.logging import configure_logging
from routers import router

# TODO make it env var
origins = [
    'http://localhost:3000'
]

async def run_migrations():
    alembic_cfg = Config("alembic.ini")
    command.upgrade(alembic_cfg, "head")


@asynccontextmanager
async def _lifespan(_app: FastAPI):
    await run_migrations()
    configure_logging()
    yield

app = FastAPI(
    debug = False,
    title="Daily",
    version="1.0",
    lifespan=_lifespan
)

app.include_router(router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
    # allow_methods=['GET', 'POST', 'OPTIONS', 'PATCH', 'PUT', 'DELETE'],
    # allow_headers=["Authorization"]
)

@app.get('/health',
         status_code=200,
         tags=['Health'])
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
