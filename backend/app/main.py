from time import perf_counter

import uvicorn
from alembic import command
from alembic.config import Config
from fastapi import FastAPI, Request
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
# from fastapi.openapi.utils import get_openapi

from app.core.config import frontend_config
from app.core.logging import configure_logging
from app.routers import router

origins = frontend_config.allowed_origins

async def run_migrations():
    try:
        alembic_cfg = Config("alembic.ini")
        command.upgrade(alembic_cfg, "head")
    except Exception as e:
        logger.error(f"Error running migrations: {e}")


@asynccontextmanager
async def _lifespan(_app: FastAPI):
    configure_logging()
    await run_migrations()
    logger.info("Application startup complete.")
    yield
    logger.info("Shutting down application...")

app = FastAPI(
    debug = False,
    title="Daily",
    version="1.0",
    lifespan=_lifespan
)

@app.middleware("http")
async def request_logging_middleware(request: Request, call_next):
    start_time = perf_counter()
    response = await call_next(request)
    # try:
    #     response = await call_next(request)
    # except Exception:
    #     duration_ms = (perf_counter() - start_time) * 1000
    #     logger.exception(
    #         f"[http]: {request.client.host}:{request.client.port} {request.method} {request.url.path} -> 500 ({duration_ms:.2f} ms)"
    #     )
    #     raise

    duration_ms = (perf_counter() - start_time) * 1000
    logger.info(f"[http]: {request.client.host}:{request.client.port} {request.method} {request.url.path} -> {response.status_code} ({duration_ms:.2f} ms)")
    return response

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

@app.get("/", status_code=200, tags=['Root'])
async def read_main():
    return {"msg": "Hello World"}

@app.get('/health',
         status_code=200,
         tags=['Health'])
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
    # Command:
    # uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
