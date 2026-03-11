import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from db.core import get_db
from app.auth.jwt_utils import get_current_user
from db.models import Users

from app.transactions.models import CreateTransaction, TransactionIndex, UpdateTransaction

router = APIRouter()

@router.get('', response_model=list[TransactionIndex])
async def get_my_transactions(
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_user)
) -> list[TransactionIndex]:
    pass


@router.get('/{transaction_id}', response_model=TransactionIndex)
async def get_my_transaction(
    transaction_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_user)
) -> TransactionIndex:
    pass


@router.post('', status_code=201)
async def create_my_new_transaction(
    data: CreateTransaction,
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    pass

@router.patch('/{transaction_id}', response_model=TransactionIndex)
async def update_my_transaction(
    transaction_id: str,
    data: UpdateTransaction,
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    pass


@router.delete('/{transaction_id}', status_code=204)
async def delete_my_transaction(
    transaction_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    pass