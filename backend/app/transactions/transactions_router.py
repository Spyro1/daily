import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from db.core import get_db
from app.auth.jwt_utils import get_current_user
from db.models import Users

from app.transactions.models import CreateTransaction, TransactionIndex, UpdateTransaction

router = APIRouter()


def _payload_for_log(data: CreateTransaction | UpdateTransaction) -> dict:
    if hasattr(data, "model_dump"):
        return data.model_dump(exclude_none=True)
    return data.dict(exclude_none=True)


def _log_context(current_user: Users, action: str) -> str:
    return f"[{current_user.display_name}][transactions/{action}]"

@router.get('', response_model=list[TransactionIndex])
async def get_my_transactions(
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_user)
) -> list[TransactionIndex]:
    log_context = _log_context(current_user, "get_my_transactions")
    logger.warning(f"{log_context}: Endpoint not implemented")
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Transactions endpoint not implemented")


@router.get('/{transaction_id}', response_model=TransactionIndex)
async def get_my_transaction(
    transaction_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_user)
) -> TransactionIndex:
    log_context = _log_context(current_user, "get_my_transaction")
    logger.warning(f"{log_context}: Endpoint not implemented transaction_id={transaction_id}")
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Transactions endpoint not implemented")


@router.post('', status_code=201)
async def create_my_new_transaction(
    data: CreateTransaction,
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    log_context = _log_context(current_user, "create_my_new_transaction")
    logger.warning(f"{log_context}: Endpoint not implemented payload={_payload_for_log(data)}")
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Transactions endpoint not implemented")

@router.patch('/{transaction_id}', response_model=TransactionIndex)
async def update_my_transaction(
    transaction_id: str,
    data: UpdateTransaction,
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    log_context = _log_context(current_user, "update_my_transaction")
    logger.warning(
        f"{log_context}: Endpoint not implemented transaction_id={transaction_id} payload={_payload_for_log(data)}"
    )
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Transactions endpoint not implemented")


@router.delete('/{transaction_id}', status_code=204)
async def delete_my_transaction(
    transaction_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    log_context = _log_context(current_user, "delete_my_transaction")
    logger.warning(f"{log_context}: Endpoint not implemented transaction_id={transaction_id}")
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Transactions endpoint not implemented")