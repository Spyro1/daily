import uuid
from datetime import datetime, timezone
from loguru import logger

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import selectinload

from db.models import Transactions
from app.transactions.models import TransactionBrief, TransactionIndex
from app.categories.services import fill_category_brief
from app.accounts.services import fill_account_brief


def _get_transaction_eager_options():
    return [
        selectinload(Transactions.source_account),
        selectinload(Transactions.destination_account),
        selectinload(Transactions.category),
    ]


async def get_transactions_for_user(db: AsyncSession, user_id: uuid.UUID, eager: bool = False) -> list[Transactions]:
    logger.debug(f"[get_transactions_for_user]: Fetching transactions for user {user_id} with eager={eager}")
    statement = select(Transactions).where(
        Transactions.user_id == user_id,
        Transactions.deleted_at.is_(None),
    )

    if eager:
        statement = statement.options(*_get_transaction_eager_options())

    try:
        result = await db.scalars(statement)
        transactions = result.all()
    except Exception as exc:
        logger.exception(f"[get_transactions_for_user]: Error fetching transactions for user {user_id}: {exc}")
        raise

    logger.debug(f"[get_transactions_for_user]: Returning {len(transactions)} transactions for user {user_id}")
    return transactions


async def get_transaction_for_user_by_id(db: AsyncSession, user_id: uuid.UUID, transaction_id: uuid.UUID, eager: bool = False) -> Transactions | None:
    logger.debug(f"[get_transaction_for_user_by_id]: Fetching transaction {transaction_id} for user {user_id} with eager={eager}")
    statement = select(Transactions).where(
        Transactions.id == transaction_id,
        Transactions.user_id == user_id,
        Transactions.deleted_at.is_(None),
    )

    if eager:
        statement = statement.options(*_get_transaction_eager_options())

    try:
        result = await db.scalars(statement)
        transaction = result.first()
    except Exception as exc:
        logger.exception(f"[get_transaction_for_user_by_id]: Error fetching transaction {transaction_id} for user {user_id}: {exc}")
        raise

    logger.debug(f"[get_transaction_for_user_by_id]: Result found={transaction is not None} id={transaction_id}")
    return transaction


async def create_transaction(db: AsyncSession, transaction: Transactions) -> Transactions:
    logger.debug(f"[create_transaction]: Creating transaction type={transaction.transaction_type} amount={transaction.amount} for user {transaction.user_id}")
    try:
        db.add(transaction)
        await db.flush()
        logger.debug(f"[create_transaction]: Flushed transaction id={transaction.id} user_id={transaction.user_id}")
        await db.commit()
        logger.debug(f"[create_transaction]: Commit succeeded for transaction id={transaction.id}")
    except IntegrityError as exc:
        await db.rollback()
        logger.exception(f"[create_transaction]: Integrity error creating transaction user_id={transaction.user_id} error={exc}")
        raise
    except Exception as exc:
        await db.rollback()
        logger.exception(f"[create_transaction]: Unexpected error creating transaction user_id={transaction.user_id} error={exc}")
        raise

    created = await get_transaction_for_user_by_id(db, transaction.user_id, transaction.id, eager=True)
    if created is None:
        logger.error(f"[create_transaction]: Created transaction could not be reloaded id={transaction.id}")
        raise RuntimeError("Created transaction could not be reloaded")
    return created


async def update_transaction(db: AsyncSession, transaction: Transactions) -> Transactions:
    logger.debug(f"[update_transaction]: Updating transaction id={transaction.id} for user {transaction.user_id}")
    try:
        await db.commit()
        logger.debug(f"[update_transaction]: Commit succeeded for transaction id={transaction.id}")
    except IntegrityError as exc:
        await db.rollback()
        logger.exception(f"[update_transaction]: Integrity error updating transaction id={transaction.id} user_id={transaction.user_id} error={exc}")
        raise
    except Exception as exc:
        await db.rollback()
        logger.exception(f"[update_transaction]: Unexpected error updating transaction id={transaction.id} user_id={transaction.user_id} error={exc}")
        raise

    updated = await get_transaction_for_user_by_id(db, transaction.user_id, transaction.id, eager=True)
    if updated is None:
        logger.error(f"[update_transaction]: Updated transaction could not be reloaded id={transaction.id}")
        raise RuntimeError("Updated transaction could not be reloaded")
    return updated


async def delete_transaction(db: AsyncSession, transaction: Transactions) -> None:
    logger.debug(f"[delete_transaction]: Soft deleting transaction id={transaction.id} for user {transaction.user_id}")
    try:
        transaction.deleted_at = datetime.now(timezone.utc)
        await db.commit()
        logger.debug(f"[delete_transaction]: Soft delete committed for transaction id={transaction.id}")
    except Exception as exc:
        await db.rollback()
        logger.exception(f"[delete_transaction]: Error deleting transaction id={transaction.id} user_id={transaction.user_id}: {exc}")
        raise


def fill_transaction_brief(transaction: Transactions) -> TransactionBrief:
    return TransactionBrief(
        id=transaction.id,
        amount=transaction.amount,
        transaction_type=transaction.transaction_type,
        category=fill_category_brief(transaction.category),
        occurred_at=transaction.occurred_at,
    )


def fill_transaction_index(transaction: Transactions) -> TransactionIndex:
    return TransactionIndex(
        id=transaction.id,
        amount=transaction.amount,
        transaction_type=transaction.transaction_type,
        category=fill_category_brief(transaction.category),
        occurred_at=transaction.occurred_at,
        source_account=fill_account_brief(transaction.source_account) if transaction.source_account else None,
        destination_account=fill_account_brief(transaction.destination_account) if transaction.destination_account else None,
        target_amount=transaction.target_amount,
        note=transaction.note,
    )