import uuid
from datetime import datetime, timezone
from loguru import logger

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError

from app.accounts.models import AccountIndex
from db.models import Accounts


def _get_account_eager_options():
    return []

async def get_accounts_for_user(db: AsyncSession, user_id: uuid.UUID, eager: bool = False) -> list[Accounts]:
    logger.debug(f"[get_accounts_for_user]: Fetching accounts for user {user_id} with eager={eager}")
    statement = select(Accounts).where(
        Accounts.user_id == user_id,
        Accounts.deleted_at.is_(None),
    )

    if eager:
        statement = statement.options(*_get_account_eager_options())

    result = await db.scalars(statement)
    return result.all()


async def get_account_for_user_by_id(db: AsyncSession, user_id: uuid.UUID, account_id: uuid.UUID, eager: bool = False) -> Accounts | None:
    logger.debug(f"[get_account_for_user_by_id]: Fetching account {account_id} for user {user_id} with eager={eager}")
    statement = select(Accounts).where(
        Accounts.user_id == user_id,
        Accounts.id == account_id,
        Accounts.deleted_at.is_(None),
    )

    if eager:
        statement = statement.options(*_get_account_eager_options())

    return await db.scalar(statement)


async def create_account(db: AsyncSession, account: Accounts) -> Accounts:
    logger.debug(f"[create_account]: Creating account {account.name} ({account.id}) for user {account.user_id}")
    try:
        db.add(account)
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise

    created_account = await get_account_for_user_by_id(db, account.user_id, account.id, eager=True)
    if created_account is None:
        raise RuntimeError("Created account could not be reloaded")
    return created_account


async def update_account(db: AsyncSession, account: Accounts) -> Accounts:
    logger.debug(f"[update_account]: Updating account {account.name} ({account.id}) for user {account.user_id}")
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise

    updated_account = await get_account_for_user_by_id(db, account.user_id, account.id, eager=True)
    if updated_account is None:
        raise RuntimeError("Updated account could not be reloaded")
    return updated_account


async def delete_account(db: AsyncSession, account: Accounts) -> None:
    logger.debug(f"[delete_account]: Soft deleting account {account.name} ({account.id}) for user {account.user_id}")
    account.deleted_at = datetime.now(timezone.utc)
    await db.commit()


def fill_account_index(account: Accounts) -> AccountIndex:
    logger.debug(f"[fill_account_index]: Filling account index for {account.name} ({account.id})")
    return AccountIndex(
        id=account.id,
        name=account.name,
        balance=account.balance,
        currency_code=account.currency_code,
        icon_name=account.icon_name,
        color=account.color or "#808080",
        include_in_total=account.include_in_total,
        is_archived=account.is_archived
    )