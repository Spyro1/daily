import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from db.core import get_db
from app.auth.jwt_utils import get_current_user
from db.models import Transactions, Users

from app.transactions.services import (
    create_transaction,
    update_transaction,
    delete_transaction,
    fill_transaction_index,
    get_transaction_for_user_by_id,
    get_transactions_for_user,
)
from app.transactions.models import CreateTransaction, TransactionIndex, UpdateTransaction

router = APIRouter()

# ================================
# Helper functions
# ================================

def _payload_for_log(data: CreateTransaction | UpdateTransaction) -> dict:
    if hasattr(data, "model_dump"):
        return data.model_dump(exclude_none=True)
    return data.dict(exclude_none=True)


def _log_context(current_user: Users, action: str) -> str:
    return f"[{current_user.display_name}][transactions/{action}]"


# ================================
# Endpoints
# ================================

@router.get('', response_model=list[TransactionIndex])
async def get_my_transactions(
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_user)
) -> list[TransactionIndex]:
    log_context = _log_context(current_user, "get_my_transactions")
    logger.info(f"{log_context}: Fetching user transactions")

    try:
        db_transactions = await get_transactions_for_user(db, current_user.id, eager=True)
    except Exception as e:
        logger.exception(f"{log_context}: Error fetching user transactions: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error fetching user transactions")

    transactions = [fill_transaction_index(t) for t in db_transactions]
    logger.info(f"{log_context}: Returning {len(transactions)} transactions")
    return transactions


@router.get('/{transaction_id}', response_model=TransactionIndex)
async def get_my_transaction(
    transaction_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_user)
) -> TransactionIndex:
    log_context = _log_context(current_user, "get_my_transaction")
    logger.info(f"{log_context}: Fetching transaction id={transaction_id}")

    try:
        db_transaction = await get_transaction_for_user_by_id(db, current_user.id, transaction_id, eager=True)
    except Exception as e:
        logger.exception(f"{log_context}: Error fetching transaction id={transaction_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error fetching transaction")

    if not db_transaction:
        logger.warning(f"{log_context}: Transaction not found id={transaction_id}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")

    logger.info(f"{log_context}: Found transaction id={db_transaction.id} type={db_transaction.transaction_type}")
    transaction = fill_transaction_index(db_transaction)
    return transaction


@router.post('', status_code=status.HTTP_201_CREATED)
async def create_my_new_transaction(
    data: CreateTransaction,
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_user)
) -> TransactionIndex:
    log_context = _log_context(current_user, "create_my_new_transaction")
    logger.info(f"{log_context}: Creating new transaction")
    logger.debug(f"{log_context}: Payload={_payload_for_log(data)} user_id={current_user.id}")

    new_transaction = Transactions(
        user_id=current_user.id,
        transaction_type=data.transaction_type.value,
        amount=data.amount,
        occurred_at=data.occurred_at,
        source_account_id=data.source_account_id,
        destination_account_id=data.destination_account_id,
        category_id=data.category_id,
        target_amount=data.target_amount,
        note=data.note,
    )
    logger.debug(
        f"{log_context}: Prepared ORM transaction type={new_transaction.transaction_type} "
        f"amount={new_transaction.amount} occurred_at={new_transaction.occurred_at}"
    )

    try:
        created = await create_transaction(db, new_transaction)
    except IntegrityError as exc:
        logger.exception(f"{log_context}: Integrity error while creating transaction: {exc}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid transaction data (check account IDs, category, and type constraints)")
    except Exception as e:
        logger.exception(f"{log_context}: Unexpected error while creating transaction: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error creating transaction")

    logger.info(f"{log_context}: Created transaction id={created.id} type={created.transaction_type}")
    return


@router.patch('/{transaction_id}', response_model=TransactionIndex)
async def update_my_transaction(
    transaction_id: uuid.UUID,
    data: UpdateTransaction,
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_user)
) -> TransactionIndex:
    log_context = _log_context(current_user, "update_my_transaction")
    logger.info(f"{log_context}: Updating transaction id={transaction_id}")
    logger.debug(f"{log_context}: transaction_id={transaction_id} payload={_payload_for_log(data)} user_id={current_user.id}")

    try:
        db_transaction = await get_transaction_for_user_by_id(db, current_user.id, transaction_id)
    except Exception as e:
        logger.exception(f"{log_context}: Error fetching transaction id={transaction_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error fetching transaction")

    if not db_transaction:
        logger.warning(f"{log_context}: Transaction not found id={transaction_id}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")

    if data.amount is not None:
        db_transaction.amount = data.amount
    if data.transaction_type is not None:
        db_transaction.transaction_type = data.transaction_type.value
    if data.occurred_at is not None:
        db_transaction.occurred_at = data.occurred_at
    if data.category_id is not None:
        db_transaction.category_id = data.category_id
    if data.source_account_id is not None:
        db_transaction.source_account_id = data.source_account_id
    if data.destination_account_id is not None:
        db_transaction.destination_account_id = data.destination_account_id
    if data.target_amount is not None:
        db_transaction.target_amount = data.target_amount
    if data.note is not None:
        db_transaction.note = data.note

    logger.debug(
        f"{log_context}: Prepared updated transaction id={db_transaction.id} "
        f"type={db_transaction.transaction_type} amount={db_transaction.amount}"
    )

    try:
        updated = await update_transaction(db, db_transaction)
    except IntegrityError as exc:
        logger.exception(f"{log_context}: Integrity error while updating transaction id={transaction_id}: {exc}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid transaction data (check account IDs, category, and type constraints)")
    except Exception as e:
        logger.exception(f"{log_context}: Unexpected error while updating transaction id={transaction_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error updating transaction")

    logger.info(f"{log_context}: Updated transaction id={updated.id} type={updated.transaction_type}")
    return fill_transaction_index(updated)


@router.delete('/{transaction_id}', status_code=204)
async def delete_my_transaction(
    transaction_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    log_context = _log_context(current_user, "delete_my_transaction")
    logger.info(f"{log_context}: Deleting transaction id={transaction_id}")

    try:
        db_transaction = await get_transaction_for_user_by_id(db, current_user.id, transaction_id)
    except Exception as e:
        logger.exception(f"{log_context}: Error fetching transaction id={transaction_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error fetching transaction")

    if not db_transaction:
        logger.warning(f"{log_context}: Transaction not found id={transaction_id}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")

    try:
        await delete_transaction(db, db_transaction)
    except Exception as e:
        logger.exception(f"{log_context}: Error deleting transaction id={transaction_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error deleting transaction")

    logger.info(f"{log_context}: Deleted transaction id={transaction_id}")
    return