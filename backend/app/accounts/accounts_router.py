import uuid
from fastapi import APIRouter, Depends
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession
from db.models import Users
from db.core import get_db
from app.auth.jwt_utils import get_current_user
from app.accounts.services import get_account_for_user_by_id, get_accounts_for_user
from app.accounts.models import AccountIndex, CreateAccount, UpdateAccount

router = APIRouter()

@router.get("", response_model=list[AccountIndex])
async def get_my_accounts(
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_user)
) -> list[AccountIndex]:
    logger.info("[accounts/get_my_accounts]: Fetching user accounts")
    return await get_accounts_for_user(db, current_user.id, eager=True)


@router.get("/{account_id}", response_model=AccountIndex)
async def get_my_account(
    account_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_user)
) -> AccountIndex:
    logger.info(f"[{current_user.name}][accounts/get_my_account]: Fetching user account")
    return await get_account_for_user_by_id(db, current_user.id, account_id, eager=True)


@router.post("", status_code=201)
async def create_my_new_account(
    data: CreateAccount,
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    logger.info(f"[{current_user.name}][accounts/create_my_new_account]: Creating new user account")
    # TODO: Implement this
    pass


@router.patch("/{account_id}")
async def update_my_account(
    account_id: uuid.UUID,
    data: UpdateAccount,
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    logger.info(f"[{current_user.name}][accounts/update_my_account]: Updating user account")
    # TODO: Implement this
    pass


@ router.delete("/{account_id}", status_code=204)
async def delete_my_account(
    account_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    logger.info(f"[{current_user.name}][accounts/delete_my_account]: Deleting user account")
    # TODO: Implement this
    pass