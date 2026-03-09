import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.auth.jwt_utils import get_current_user
from db.core import get_db
from app.accounts.models import AccountIndex, CreateAccount, UpdateAccount

router = APIRouter()

@router.get("", response_model=list[AccountIndex])
async def get_my_accounts(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
) -> list[AccountIndex]:
    return []


@router.get("/{account_id}")
async def get_my_account(
    account_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
) -> AccountIndex:
    return AccountIndex()

@router.post("", status_code=201)
async def create_my_new_account(
    data: CreateAccount,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    pass

@router.patch("/{account_id}")
async def update_my_account(
    account_id: uuid.UUID,
    data: UpdateAccount,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    pass

@ router.delete("/{account_id}", status_code=204)
async def delete_my_account(
    account_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    pass