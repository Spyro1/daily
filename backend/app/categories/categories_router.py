import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from db.core import get_db
from app.auth.jwt_utils import get_current_user
from db.models import Users

from app.categories.models import CategoryIndex, UpdateCategory, CreateCategory

router = APIRouter()

@router.get('', response_model=list[CategoryIndex])
async def get_my_categories(
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_user)
) -> list[CategoryIndex]:
    pass


@router.get('/{category_id}', response_model=CategoryIndex)
async def get_my_category(
    category_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_user)
) -> CategoryIndex:
    pass


@router.post('', status_code=201)
async def create_my_new_category(
    data: CreateCategory,
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    pass

@router.patch('/{category_id}', response_model=CategoryIndex)
async def update_my_category(
    category_id: str,
    data: UpdateCategory,
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    pass


@router.delete('/{category_id}', status_code=204)
async def delete_my_category(
    category_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    pass