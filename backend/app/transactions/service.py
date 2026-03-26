import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional
from loguru import logger

from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import selectinload

from db.models import Transactions
from app.transactions.schemas import TransactionBrief, TransactionIndex, TransactionType
from app.categories.service import fill_category_brief
from app.accounts.service import fill_account_brief


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


async def get_transactions_for_user_filtered(
    db: AsyncSession,
    user_id: uuid.UUID,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    category_id: Optional[uuid.UUID] = None,
    account_id: Optional[uuid.UUID] = None,
    transaction_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    eager: bool = True,
) -> tuple[list[Transactions], int]:
    """
    Fetch transactions with optional filters and pagination.
    Returns a tuple of (transactions, total_count) for pagination support.
    """
    filters = [
        Transactions.user_id == user_id,
        Transactions.deleted_at.is_(None),
    ]

    if date_from:
        filters.append(Transactions.occurred_at >= date_from)
    if date_to:
        filters.append(Transactions.occurred_at <= date_to)
    if category_id:
        filters.append(Transactions.category_id == category_id)
    if transaction_type:
        filters.append(Transactions.transaction_type == transaction_type)
    if account_id:
        # Match either source or destination account
        filters.append(
            or_(
                Transactions.source_account_id == account_id,
                Transactions.destination_account_id == account_id,
            )
        )

    # Get total count before pagination
    count_statement = select(Transactions).where(and_(*filters))
    try:
        count_result = await db.scalars(count_statement)
        total_count = len(count_result.all())
    except Exception as exc:
        logger.exception(f"[get_transactions_for_user_filtered]: Error counting transactions for user {user_id}: {exc}")
        raise

    # Get paginated results
    statement = (
        select(Transactions)
        .where(and_(*filters))
        .order_by(Transactions.occurred_at.desc())
        .offset(skip)
        .limit(limit)
    )

    if eager:
        statement = statement.options(*_get_transaction_eager_options())

    try:
        result = await db.scalars(statement)
        transactions = result.all()
    except Exception as exc:
        logger.exception(f"[get_transactions_for_user_filtered]: Error fetching filtered transactions for user {user_id}: {exc}")
        raise

    logger.debug(
        f"[get_transactions_for_user_filtered]: Returning {len(transactions)} of {total_count} transactions "
        f"(skip={skip}, limit={limit}) for user {user_id}"
    )
    return transactions, total_count


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
    # Normalize source and destination accounts to avoid nulls in the response. If both are null, use a fallback "Unknown account". If one is null, use the other as both source and destination (this can happen for expenses and incomes where only one account is involved).
    source = fill_account_brief(transaction.source_account) if transaction.source_account else None
    destination = fill_account_brief(transaction.destination_account) if transaction.destination_account else None

    if source is None and destination is None:
        logger.exception(
            f"Transaction id={transaction.id} has no source or destination account. Using fallback account for both. This should not happen for transfer transactions. user_id={transaction.user_id}"
        )
        raise RuntimeError(f"Transaction id={transaction.id} has no source or destination account")

    return TransactionIndex(
        id=transaction.id,
        amount=transaction.amount,
        transaction_type=transaction.transaction_type,
        category=fill_category_brief(transaction.category),
        occurred_at=transaction.occurred_at,
        source_account=source,
        destination_account=destination,
        target_amount=transaction.target_amount,
        note=transaction.note or "",
    )