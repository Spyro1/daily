import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from db.core import get_db
from app.auth.jwt_utils import get_current_user
from db.models import Accounts, Users

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


def _payload_for_log(data: CreateAccount | UpdateAccount) -> dict:
    if hasattr(data, "model_dump"):
        return data.model_dump(exclude_none=True)
    return data.dict(exclude_none=True)


def _log_context(current_user: Users, action: str) -> str:
    return f"[{current_user.display_name}][accounts/{action}]"

@router.get("", response_model=list[AccountIndex])
async def get_my_accounts(
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_user)
) -> list[AccountIndex]:
    log_context = _log_context(current_user, "get_my_accounts")
    logger.info(f"{log_context}: Fetching user accounts")
    # TODO: Add pagination and filtering (e.g. include_archived) in the future when we have more accounts per user
    try:
        db_accounts = await get_accounts_for_user(db, current_user.id, eager=True)
    except Exception as e:
        logger.exception(f"{log_context}: Error fetching user accounts: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error fetching user accounts")

    accounts = [fill_account_index(acc) for acc in db_accounts]
    logger.info(f"{log_context}: Returning {len(accounts)} accounts")
    return accounts


@router.get("/{account_id}", response_model=AccountIndex)
async def get_my_account(
    account_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_user)
) -> AccountIndex:
    log_context = _log_context(current_user, "get_my_account")
    logger.info(f"{log_context}: Fetching user account id={account_id}")
    # TODO: Add option to include_archived in the future when we have archived accounts
    try:
        db_account = await get_account_for_user_by_id(db, current_user.id, account_id, eager=True)
    except Exception as e:
        logger.exception(f"{log_context}: Error fetching user account id={account_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error fetching user account")

    if not db_account:
        logger.warning(f"{log_context}: Account not found id={account_id}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")

    logger.info(f"{log_context}: Found account id={db_account.id} name={db_account.name}")
    return fill_account_index(db_account)


@router.post("", status_code=201)
async def create_my_new_account(
    data: CreateAccount,
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_user)
)-> AccountIndex:
    log_context = _log_context(current_user, "create_my_new_account")
    logger.info(f"{log_context}: Creating new user account")
    logger.debug(f"{log_context}: Payload={_payload_for_log(data)} user_id={current_user.id}")

    new_account = Accounts(
        user_id=current_user.id,
        name=data.name,
        currency_code=data.currency_code,
        icon_name=data.icon_name,
        color=data.color,
        include_in_total=data.include_in_total,
    )
    logger.debug(
        f"{log_context}: Prepared ORM account name={new_account.name} currency_code={new_account.currency_code} "
        f"icon_name={new_account.icon_name} include_in_total={new_account.include_in_total}"
    )
    try:
        created_account = await create_account(db, new_account)
    except IntegrityError as exc:
        logger.exception(f"{log_context}: Integrity error while creating account: {exc}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Database integrity error (possibly duplicate account name)")
    except Exception as e:
        logger.exception(f"{log_context}: Unexpected error while creating user account: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error creating user account")

    # TODO: Create starting balance transaction if balance is provided (need to add 'amount' to CreateAccount model and handle it in the service layer)
    logger.info(f"{log_context}: Created account id={created_account.id} name={created_account.name}")
    return fill_account_index(created_account)

    
@router.patch("/{account_id}", response_model=AccountIndex)
async def update_my_account(
    account_id: uuid.UUID,
    data: UpdateAccount,
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_user)
) -> AccountIndex:
    log_context = _log_context(current_user, "update_my_account")
    logger.info(f"{log_context}: Updating user account id={account_id}")
    logger.debug(f"{log_context}: Payload={_payload_for_log(data)} user_id={current_user.id}")

    try:
        db_account = await get_account_for_user_by_id(db, current_user.id, account_id, eager=True)
    except Exception as e:
        logger.exception(f"{log_context}: Error fetching user account id={account_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error fetching user account")

    if not db_account:
        logger.warning(f"{log_context}: Account not found id={account_id}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")

    if data.name is not None: db_account.name = data.name
    if data.currency_code is not None: db_account.currency_code = data.currency_code
    if data.icon_name is not None: db_account.icon_name = data.icon_name
    if data.color is not None: db_account.color = data.color
    if data.include_in_total is not None: db_account.include_in_total = data.include_in_total
    if data.is_archived is not None: db_account.is_archived = data.is_archived

    logger.debug(
        f"{log_context}: Prepared updated account id={db_account.id} name={db_account.name} "
        f"currency_code={db_account.currency_code} include_in_total={db_account.include_in_total} "
        f"is_archived={db_account.is_archived}"
    )

    try:
        updated = await update_account(db, db_account)
    except IntegrityError as exc:
        logger.exception(f"{log_context}: Integrity error while updating account id={account_id}: {exc}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Database integrity error (possibly duplicate account name)")
    except Exception as e:
        logger.exception(f"{log_context}: Unexpected error while updating user account id={account_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error updating user account")

    if data.balance is not None:
        # TODO: Create a transaction to adjust the balance to the new value (need to calculate the difference and create a transaction with that amount, maybe with a special category or flag to indicate it's a balance adjustment)
        pass
    logger.info(f"{log_context}: Updated account id={updated.id} name={updated.name}")
    return fill_account_index(updated)


@router.delete("/{account_id}", status_code=204)
async def delete_my_account(
    account_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    log_context = _log_context(current_user, "delete_my_account")
    logger.info(f"{log_context}: Deleting user account id={account_id}")

    try:
        db_account = await get_account_for_user_by_id(db, current_user.id, account_id, eager=False)
    except Exception as e:
        logger.exception(f"{log_context}: Error fetching user account id={account_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error fetching user account")

    if not db_account:
        logger.warning(f"{log_context}: Account not found id={account_id}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")

    try:
        await delete_account(db, db_account)
    except Exception as e:
        logger.exception(f"{log_context}: Error deleting user account id={account_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error deleting user account")

    logger.info(f"{log_context}: Deleted account id={account_id}")