"""Daily — FastAPI application entry point."""

from contextlib import asynccontextmanager
from time import perf_counter

import uvicorn
from alembic import command
from alembic.config import Config
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from loguru import logger
from sqlalchemy.exc import OperationalError

from app.core.config import frontend_config
from app.core.logging import configure_logging
from app.routers import router
from db.core import ensure_database_exists, should_create_database_for_error


# ─── Startup ────────────────────────────────────────────────────────

async def _run_migrations() -> None:
    """Run Alembic migrations, creating the database first if necessary."""
    try:
        alembic_cfg = Config("alembic.ini")
        command.upgrade(alembic_cfg, "head")
    except OperationalError as exc:
        if should_create_database_for_error(exc):
            logger.warning("Configured database is missing — attempting to create it")
            try:
                if ensure_database_exists():
                    command.upgrade(Config("alembic.ini"), "head")
                    return
            except Exception as create_err:
                logger.error(f"Failed to create missing database: {create_err}")
        logger.error(f"Error running migrations: {exc}")
    except Exception as exc:
        logger.error(f"Error running migrations: {exc}")


@asynccontextmanager
async def _lifespan(_app: FastAPI):
    configure_logging()
    await _run_migrations()
    logger.info("Application startup complete.")
    yield
    logger.info("Shutting down application…")


# ─── Application ────────────────────────────────────────────────────

app = FastAPI(
    debug=False,
    title="Daily",
    version="1.0",
    lifespan=_lifespan,
)

app.include_router(router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_config.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Exception handler (ensures CORS headers on 500s) ───────────────

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled exception on {request.method} {request.url.path}: {exc}")
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


# ─── Middleware ──────────────────────────────────────────────────────

@app.middleware("http")
async def request_logging_middleware(request: Request, call_next):
    start = perf_counter()
    response = await call_next(request)
    ms = (perf_counter() - start) * 1000
    client = f"{request.client.host}:{request.client.port}" if request.client else "-"
    logger.info(
        f"[http]: {client} "
        f"{request.method} {request.url.path} -> {response.status_code} ({ms:.2f} ms)"
    )
    return response


# ─── Health / root ──────────────────────────────────────────────────

@app.get("/", status_code=200, tags=["Root"])
async def read_main():
    return {"msg": "Hello World"}


@app.get("/health", status_code=200, tags=["Health"])
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
    # Command:
    # uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
