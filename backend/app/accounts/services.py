import uuid
from loguru import logger

from sqlalchemy import select, update, delete
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from db.models import Accounts


def _get_account_eager_options():
    return [
        selectinload(Accounts.transactions),
    ]

async def get_accounts_for_user(db: AsyncSession, user_id: uuid.UUID, eager: bool = False) -> list[Accounts]:
    if eager:
        return await db.scalars(select(Accounts)
                    .where(Accounts.user_id == user_id, Accounts.deleted_at == None)
                    .options(*_get_account_eager_options())).all()
    else:
        return await db.scalars(select(Accounts)
                    .where(Accounts.user_id == user_id, Accounts.deleted_at == None)).all()


async def get_account_for_user_by_id(db: AsyncSession, user_id: uuid.UUID, account_id: uuid.UUID, eager: bool = False) -> Accounts:
    if eager:
        logger.debug(f"[]")
        return await db.scalar(select(Accounts)
                    .where(Accounts.user_id == user_id, 
                           Accounts.id == account_id,
                           Accounts.deleted_at == None)
                    .options(*_get_account_eager_options())).first()
    else:
        return await db.scalar(select(Accounts)
                    .where(Accounts.user_id == user_id, 
                           Accounts.id == account_id,
                           Accounts.deleted_at == None)).first()
