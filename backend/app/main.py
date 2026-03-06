import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

import uvicorn
import logging

from routers import router

logger = logging.getLogger("uvicorn.error")

# TODO make it env var
origins = [
    'http://localhost:3000'
]

# async def run_migrations():
#     alembic_cfg = Config("alembic.ini")
#     command.upgrade(alembic_cfg, "head")

app = FastAPI(
    debug = False,
    title="Daily",
    version="1.0",
)

app.include_router(router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['GET', 'POST', 'OPTIONS', 'PATCH', 'PUT', 'DELETE'],
    # allow_headers=["Authorization"]
)

@app.get('/health',
         status_code=200)
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
