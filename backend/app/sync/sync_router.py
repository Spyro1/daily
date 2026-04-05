"""
Sync router — one-time push of locally-stored data from the frontend's
IndexedDB into the authenticated user's backend records.
"""

from fastapi import APIRouter, Depends
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.jwt_utils import get_current_user
from app.sync.schemas import SyncPushRequest, SyncPushResponse
from app.sync.service import push_local_data
from db.core import get_db
from db.models import Users

router = APIRouter()


@router.post("/push", response_model=SyncPushResponse)
async def sync_push(
    body: SyncPushRequest,
    current_user: Users = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Receive locally-stored accounts, categories, and transactions from the
    frontend and persist them under the current authenticated user.

    This is intended as a one-time bulk upload right after the user signs in
    via Google for the first time.  Rows whose ``id`` already exist are
    silently skipped (idempotent).
    """
    logger.info(f"[sync/push]: user_id={current_user.id}")
    return await push_local_data(db, current_user.id, body)
