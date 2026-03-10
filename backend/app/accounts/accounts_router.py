import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError

from db.models import Accounts, Users
from db.core import get_db
from app.auth.jwt_utils import get_current_user
from app.accounts.services import (
    create_account,
    update_account,
    delete_account,
    fill_account_index,
    get_account_for_user_by_id,
    get_accounts_for_user,
)
from app.accounts.models import AccountIndex, CreateAccount, UpdateAccount

router = APIRouter()

@router.get("", response_model=list[AccountIndex])
async def get_my_accounts(
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_user)
) -> list[AccountIndex]:
    logger.info("[accounts/get_my_accounts]: Fetching user accounts")
    try:
        db_accounts = await get_accounts_for_user(db, current_user.id, eager=True)
    except Exception as e:
        logger.error(f"[accounts/get_my_accounts]: Error fetching user accounts: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error fetching user accounts")

    return [fill_account_index(acc) for acc in db_accounts]


@router.get("/{account_id}", response_model=AccountIndex)
async def get_my_account(
    account_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_user)
) -> AccountIndex:
    logger.info(f"[{current_user.display_name}][accounts/get_my_account]: Fetching user account")
    try:
        db_account = await get_account_for_user_by_id(db, current_user.id, account_id, eager=True)
    except Exception as e:
        logger.error(f"[accounts/get_my_account]: Error fetching user account: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error fetching user account")

    if not db_account:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")

    return fill_account_index(db_account)


@router.post("", status_code=201)
async def create_my_new_account(
    data: CreateAccount,
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_user)
)-> AccountIndex:
    logger.info(f"[{current_user.display_name}][accounts/create_my_new_account]: Creating new user account")

    # if not db_icon:
    #     raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Icon not found")

    new_account = Accounts(
        user_id=current_user.id,
        name=data.name,
        currency_code=data.currency_code,
        icon_name=data.icon_name,
        color=data.color,
        include_in_total=data.include_in_total,
    )
    try:
        created_account = await create_account(db, new_account)
    except IntegrityError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Account with this name already exists")
    except Exception as e:
        logger.error(f"[accounts/create_my_new_account]: Error creating user account: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error creating user account")

    # TODO: Create starting balance transaction if balance is provided (need to add 'amount' to CreateAccount model and handle it in the service layer)

    return fill_account_index(created_account)

    
@router.patch("/{account_id}", response_model=AccountIndex)
async def update_my_account(
    account_id: uuid.UUID,
    data: UpdateAccount,
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_user)
) -> AccountIndex:
    logger.info(f"[{current_user.display_name}][accounts/update_my_account]: Updating user account")
    db_account = await get_account_for_user_by_id(db, current_user.id, account_id, eager=True)

    if not db_account:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")

    if data.name is not None: db_account.name = data.name
    if data.currency_code is not None: db_account.currency_code = data.currency_code
    if data.icon_name is not None: db_account.icon_name = data.icon_name
    if data.color is not None: db_account.color = data.color
    if data.include_in_total is not None: db_account.include_in_total = data.include_in_total
    if data.is_archived is not None: db_account.is_archived = data.is_archived

    try:
        updated = await update_account(db, db_account)
    except IntegrityError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Account with this name already exists")

    if data.balance is not None:
        # TODO: Create a transaction to adjust the balance to the new value (need to calculate the difference and create a transaction with that amount, maybe with a special category or flag to indicate it's a balance adjustment)
        pass

    return fill_account_index(updated)


@router.delete("/{account_id}", status_code=204)
async def delete_my_account(
    account_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    logger.info(f"[{current_user.display_name}][accounts/delete_my_account]: Deleting user account")
    db_account = await get_account_for_user_by_id(db, current_user.id, account_id, eager=False)

    if not db_account:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")

    await delete_account(db, db_account)