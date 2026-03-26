import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from db.core import get_db
from app.auth.jwt_utils import get_current_user
from db.models import Categories, Users

from backend.app.categories.service import create_category, delete_category, get_categories_for_user, fill_category_index, get_category_for_user_by_id, update_category
from backend.app.categories.schemas import CategoryIndex, UpdateCategory, CreateCategory

router = APIRouter()

# ================================
# Helper functions
# ================================

def _payload_for_log(data: CreateCategory | UpdateCategory) -> dict:
    if hasattr(data, "model_dump"):
        return data.model_dump(exclude_none=True)
    return data.dict(exclude_none=True)


def _log_context(current_user: Users, action: str) -> str:
    return f"[{current_user.display_name}][categories/{action}]"


# ================================
# Endpoints
# ================================

@router.get('', response_model=list[CategoryIndex])
async def get_my_categories(
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_user)
) -> list[CategoryIndex]:
    log_context = _log_context(current_user, "get_my_categories")
    logger.info(f"{log_context}: Fetching user categories")
    
    try:
        db_categories = await get_categories_for_user(db, current_user.id)
    except Exception as e:
        logger.exception(f"{log_context}: Error fetching user categories: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error fetching user categories")

    categories = [fill_category_index(category) for category in db_categories]
    logger.info(f"{log_context}: Returning {len(categories)} categories")
    return categories    


@router.get('/{category_id}', response_model=CategoryIndex)
async def get_my_category(
    category_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_user)
) -> CategoryIndex:
    log_context = _log_context(current_user, "get_my_category")
    logger.info(f"{log_context}: Fetching user category id={category_id}")
    
    try:
        db_category = await get_category_for_user_by_id(db, current_user.id, uuid.UUID(category_id))
    except Exception as e:
        logger.exception(f"{log_context}: Error fetching user category id={category_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error fetching user category")

    if not db_category:
        logger.warning(f"{log_context}: Category not found id={category_id}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    logger.info(f"{log_context}: Found category id={db_category.id} name={db_category.name}")
    return fill_category_index(db_category)


@router.post('', status_code=status.HTTP_201_CREATED)
async def create_my_new_category(
    data: CreateCategory,
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    log_context = _log_context(current_user, "create_my_new_category")
    logger.info(f"{log_context}: Creating new category")
    logger.debug(
        f"{log_context}: "
        f"Payload={_payload_for_log(data)} user_id={current_user.id}"
    )

    new_category = Categories(
        user_id=current_user.id,
        name=data.name,
        parent_id=data.parent_id,
        icon_name=data.icon_name,
        color=data.color,
        category_type=data.type.value,
    )

    logger.debug(
        f"{log_context}: "
        f"Prepared ORM category name={new_category.name} user_id={new_category.user_id} "
        f"parent_id={new_category.parent_id} category_type={new_category.category_type}"
    )

    try:
        created_category = await create_category(db, new_category)
    except IntegrityError as exc:
        logger.exception(f"{log_context}: Integrity error while creating category: {exc}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Database integrity error (possibly duplicate category name)")
    except Exception as e:
        logger.exception(f"{log_context}: Unexpected error while creating category: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error creating user category")

    logger.info(
        f"{log_context}: "
        f"Created category id={created_category.id} name={created_category.name}"
    )
    return

@router.patch('/{category_id}', response_model=CategoryIndex)
async def update_my_category(
    category_id: str,
    data: UpdateCategory,
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    log_context = _log_context(current_user, "update_my_category")
    logger.info(f"{log_context}: Updating category id={category_id}")
    logger.debug(
        f"{log_context}: "
        f"category_id={category_id} payload={_payload_for_log(data)} user_id={current_user.id}"
    )

    try:
        db_category = await get_category_for_user_by_id(db, current_user.id, uuid.UUID(category_id))
    except Exception as e:
        logger.exception(f"{log_context}: Error fetching user category id={category_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error fetching user category")

    if not db_category:
        logger.warning(f"{log_context}: Category not found id={category_id}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    # Update fields if provided
    if data.name is not None:
        db_category.name = data.name
    if data.parent_id is not None:
        db_category.parent_id = data.parent_id
    if data.icon_name is not None:
        db_category.icon_name = data.icon_name
    if data.color is not None:
        db_category.color = data.color
    if data.type is not None:
        db_category.category_type = data.type.value

    logger.debug(
        f"{log_context}: "
        f"Prepared updated category id={db_category.id} name={db_category.name} "
        f"parent_id={db_category.parent_id} category_type={db_category.category_type}"
    )

    try:
        updated_category = await update_category(db, db_category)
    except IntegrityError as exc:
        logger.exception(f"{log_context}: Integrity error while updating category id={category_id}: {exc}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Database integrity error (possibly duplicate category name)")
    except Exception as e:
        logger.exception(f"{log_context}: Unexpected error while updating category id={category_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error updating user category")

    logger.info(
        f"{log_context}: "
        f"Updated category id={updated_category.id} name={updated_category.name}"
    )
    return fill_category_index(updated_category)


@router.delete('/{category_id}', status_code=204)
async def delete_my_category(
    category_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    log_context = _log_context(current_user, "delete_my_category")
    logger.info(f"{log_context}: Deleting category id={category_id}")

    try:
        db_category = await get_category_for_user_by_id(db, current_user.id, uuid.UUID(category_id))
    except Exception as e:
        logger.exception(f"{log_context}: Error fetching user category id={category_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error fetching user category")

    if not db_category:
        logger.warning(f"{log_context}: Category not found id={category_id}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    try:
        await delete_category(db, db_category)
    except Exception as e:
        logger.exception(f"{log_context}: Error deleting user category id={category_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error deleting user category")

    logger.info(f"{log_context}: Deleted category id={category_id}")