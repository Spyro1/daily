import uuid
from datetime import datetime, timezone
from loguru import logger

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError

from backend.app.accounts.schemas import AccountBrief, AccountIndex
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

    try:
        result = await db.scalars(statement)
        accounts = result.all()
    except Exception as exc:
        logger.exception(f"[get_accounts_for_user]: Error fetching accounts for user {user_id} with eager={eager}: {exc}")
        raise

    logger.debug(f"[get_accounts_for_user]: Returning {len(accounts)} accounts for user {user_id}")
    return accounts


async def get_account_for_user_by_id(db: AsyncSession, user_id: uuid.UUID, account_id: uuid.UUID, eager: bool = False) -> Accounts | None:
    logger.debug(f"[get_account_for_user_by_id]: Fetching account {account_id} for user {user_id} with eager={eager}")
    statement = select(Accounts).where(
        Accounts.id == account_id,
        Accounts.user_id == user_id,
        Accounts.deleted_at.is_(None),
    )

    if eager:
        statement = statement.options(*_get_account_eager_options())

    try:
        result = await db.scalars(statement)
        account = result.first()
    except Exception as exc:
        logger.exception(
            f"[get_account_for_user_by_id]: Error fetching account {account_id} for user {user_id} with eager={eager}: {exc}"
        )
        raise

    logger.debug(
        f"[get_account_for_user_by_id]: Result for account {account_id} user {user_id}: found={account is not None}"
    )
    return account


async def create_account(db: AsyncSession, account: Accounts) -> Accounts:
    logger.debug(f"[create_account]: Creating account {account.name} ({account.id}) for user {account.user_id}")
    try:
        db.add(account)
        await db.flush()
        logger.debug(
            f"[create_account]: Flushed account id={account.id} user_id={account.user_id} "
            f"currency_code={account.currency_code} include_in_total={account.include_in_total}"
        )
        await db.commit()
        logger.debug(f"[create_account]: Commit succeeded for account id={account.id}")
    except IntegrityError as exc:
        await db.rollback()
        logger.exception(
            f"[create_account]: Integrity error creating account name={account.name} user_id={account.user_id} error={exc}"
        )
        raise
    except Exception as exc:
        await db.rollback()
        logger.exception(
            f"[create_account]: Unexpected error creating account name={account.name} user_id={account.user_id} error={exc}"
        )
        raise

    created_account = await get_account_for_user_by_id(db, account.user_id, account.id, eager=True)
    if created_account is None:
        logger.error(f"[create_account]: Created account could not be reloaded id={account.id} user_id={account.user_id}")
        raise RuntimeError("Created account could not be reloaded")
    return created_account


async def update_account(db: AsyncSession, account: Accounts) -> Accounts:
    logger.debug(f"[update_account]: Updating account {account.name} ({account.id}) for user {account.user_id}")
    try:
        await db.commit()
        logger.debug(f"[update_account]: Commit succeeded for account id={account.id}")
    except IntegrityError as exc:
        await db.rollback()
        logger.exception(
            f"[update_account]: Integrity error updating account id={account.id} name={account.name} user_id={account.user_id} error={exc}"
        )
        raise
    except Exception as exc:
        await db.rollback()
        logger.exception(
            f"[update_account]: Unexpected error updating account id={account.id} name={account.name} user_id={account.user_id} error={exc}"
        )
        raise

    updated_account = await get_account_for_user_by_id(db, account.user_id, account.id, eager=True)
    if updated_account is None:
        logger.error(f"[update_account]: Updated account could not be reloaded id={account.id} user_id={account.user_id}")
        raise RuntimeError("Updated account could not be reloaded")
    return updated_account


async def delete_account(db: AsyncSession, account: Accounts) -> None:
    logger.debug(f"[delete_account]: Soft deleting account {account.name} ({account.id}) for user {account.user_id}")
    try:
        account.deleted_at = datetime.now(timezone.utc)
        await db.commit()
        logger.debug(f"[delete_account]: Soft delete committed for account id={account.id}")
    except Exception as exc:
        await db.rollback()
        logger.exception(f"[delete_account]: Error deleting account id={account.id} user_id={account.user_id}: {exc}")
        raise


def fill_account_brief(account: Accounts) -> AccountBrief:
    logger.debug(f"[fill_account_brief]: Filling account brief for {account.name} ({account.id})")
    return AccountBrief(
        id=account.id,
        name=account.name,
        balance=account.balance,
        currency_code=account.currency_code
    ) 

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