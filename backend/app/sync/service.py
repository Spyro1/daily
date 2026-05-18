"""Service layer for the sync push operation."""

import uuid
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.sync.schemas import SyncPushRequest, SyncPushResponse
from db.models import Accounts, Categories, Transactions


async def push_local_data(
    db: AsyncSession,
    user_id: uuid.UUID,
    payload: SyncPushRequest,
) -> SyncPushResponse:
    """
    Persist locally-stored accounts, categories, and transactions for an
    authenticated user.  This is an idempotent upsert -- rows whose `id`
    already exist under this user are silently skipped.

    Insertion order:  accounts -> categories -> transactions  (FK deps).
    """
    request_id = str(uuid.uuid4())[:8]
    logger.info(
        f"[{request_id}][sync/push]: user_id={user_id} "
        f"accounts={len(payload.accounts)} categories={len(payload.categories)} "
        f"transactions={len(payload.transactions)}"
    )

    accounts_created = 0
    categories_created = 0
    transactions_created = 0

    try:
        # -- 1. Accounts --
        if payload.accounts:
            existing_ids = set(
                (
                    await db.scalars(
                        select(Accounts.id).where(
                            Accounts.user_id == user_id,
                            Accounts.deleted_at.is_(None),
                        )
                    )
                ).all()
            )

            for acct in payload.accounts:
                if acct.id in existing_ids:
                    logger.debug(f"[{request_id}][sync/push]: skipping existing account {acct.id}")
                    continue
                db.add(
                    Accounts(
                        id=acct.id,
                        user_id=user_id,
                        name=acct.name,
                        currency_code=acct.currency_code,
                        icon_name=acct.icon_name,
                        color=acct.color,
                        include_in_total=acct.include_in_total,
                        is_archived=acct.is_archived,
                    )
                )
                accounts_created += 1

            await db.flush()
            logger.info(f"[{request_id}][sync/push]: {accounts_created} accounts inserted")

        # -- 2. Categories --
        if payload.categories:
            existing_ids = set(
                (
                    await db.scalars(
                        select(Categories.id).where(
                            Categories.user_id == user_id,
                            Categories.deleted_at.is_(None),
                        )
                    )
                ).all()
            )

            parents = [c for c in payload.categories if c.parent_id is None]
            children = [c for c in payload.categories if c.parent_id is not None]

            for cat in parents + children:
                if cat.id in existing_ids:
                    logger.debug(f"[{request_id}][sync/push]: skipping existing category {cat.id}")
                    continue
                db.add(
                    Categories(
                        id=cat.id,
                        user_id=user_id,
                        parent_id=cat.parent_id,
                        name=cat.name,
                        category_type=cat.category_type,
                        icon_name=cat.icon_name,
                        color=cat.color,
                    )
                )
                categories_created += 1

            await db.flush()
            logger.info(f"[{request_id}][sync/push]: {categories_created} categories inserted")

        # -- 3. Transactions --
        if payload.transactions:
            existing_ids = set(
                (
                    await db.scalars(
                        select(Transactions.id).where(
                            Transactions.user_id == user_id,
                            Transactions.deleted_at.is_(None),
                        )
                    )
                ).all()
            )

            for txn in payload.transactions:
                if txn.id in existing_ids:
                    logger.debug(f"[{request_id}][sync/push]: skipping existing transaction {txn.id}")
                    continue
                db.add(
                    Transactions(
                        id=txn.id,
                        user_id=user_id,
                        source_account_id=txn.source_account_id,
                        destination_account_id=txn.destination_account_id,
                        category_id=txn.category_id,
                        transaction_type=txn.transaction_type,
                        amount=txn.amount,
                        target_amount=txn.target_amount,
                        occurred_at=txn.occurred_at,
                        note=txn.note,
                    )
                )
                transactions_created += 1

            await db.flush()
            logger.info(f"[{request_id}][sync/push]: {transactions_created} transactions inserted")

        await db.commit()

    except IntegrityError as exc:
        await db.rollback()
        logger.error(f"[{request_id}][sync/push]: IntegrityError: {exc}")
        raise
    except Exception as exc:
        await db.rollback()
        logger.exception(f"[{request_id}][sync/push]: Unexpected error: {exc}")
        raise

    result = SyncPushResponse(
        accounts_created=accounts_created,
        categories_created=categories_created,
        transactions_created=transactions_created,
    )
    logger.info(f"[{request_id}][sync/push]: completed -- {result}")
    return result
