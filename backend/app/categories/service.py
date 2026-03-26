import uuid
from datetime import datetime, timezone
from loguru import logger

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError

from backend.app.categories.schemas import CategoryBrief, CategoryIndex
from db.models import Categories


async def get_categories_for_user(db: AsyncSession, user_id: uuid.UUID) -> list[CategoryIndex]:
    logger.debug(f"[get_categories_for_user]: Fetching categories for user {user_id}")
    statement = select(Categories).where(
        Categories.user_id == user_id,
        Categories.deleted_at.is_(None),
    )

    result = await db.execute(statement)
    return result.scalars().all()

async def get_category_for_user_by_id(db: AsyncSession, user_id: uuid.UUID, category_id: uuid.UUID) -> Categories | None:
    logger.debug(f"[get_category_for_user_by_id]: Fetching category {category_id} for user {user_id}")
    statement = select(Categories).where(
        Categories.id == category_id,
        Categories.user_id == user_id,
        Categories.deleted_at.is_(None),
    )

    result = await db.execute(statement)
    return result.scalars().first()

async def create_category(db: AsyncSession, category: Categories) -> Categories:
    logger.debug(f"[create_category]: Creating category {category.name} ({category.id}) for user {category.user_id}")
    try:
        db.add(category)
        await db.flush()
        logger.debug(
            f"[create_category]: Flushed category id={category.id} user_id={category.user_id} "
            f"parent_id={category.parent_id} category_type={category.category_type}"
        )
        await db.commit()
        logger.debug(f"[create_category]: Commit succeeded for category id={category.id}")
    except IntegrityError as exc:
        await db.rollback()
        logger.exception(
            f"[create_category]: Integrity error creating category name={category.name} "
            f"user_id={category.user_id} parent_id={category.parent_id} "
            f"category_type={category.category_type} error={exc}"
        )
        raise
    except Exception as exc:
        await db.rollback()
        logger.exception(
            f"[create_category]: Unexpected error creating category name={category.name} "
            f"user_id={category.user_id} parent_id={category.parent_id} "
            f"category_type={category.category_type} error={exc}"
        )
        raise

    created_category = await get_category_for_user_by_id(db, category.user_id, category.id)
    if created_category is None:
        logger.error(
            f"[create_category]: Created category could not be reloaded id={category.id} user_id={category.user_id}"
        )
        raise RuntimeError("Created category could not be reloaded")
    return created_category


async def update_category(db: AsyncSession, category: Categories) -> Categories:
    logger.debug(f"[update_category]: Updating category {category.name} ({category.id}) for user {category.user_id}")
    try:
        await db.commit()
        logger.debug(f"[update_category]: Commit succeeded for category id={category.id}")
    except IntegrityError as exc:
        await db.rollback()
        logger.exception(
            f"[update_category]: Integrity error updating category id={category.id} "
            f"name={category.name} user_id={category.user_id} parent_id={category.parent_id} "
            f"category_type={category.category_type} error={exc}"
        )
        raise
    except Exception as exc:
        await db.rollback()
        logger.exception(
            f"[update_category]: Unexpected error updating category id={category.id} "
            f"name={category.name} user_id={category.user_id} parent_id={category.parent_id} "
            f"category_type={category.category_type} error={exc}"
        )
        raise

    updated_category = await get_category_for_user_by_id(db, category.user_id, category.id)
    if updated_category is None:
        logger.error(
            f"[update_category]: Updated category could not be reloaded id={category.id} user_id={category.user_id}"
        )
        raise RuntimeError("Updated category could not be reloaded")
    return updated_category


async def delete_category(db: AsyncSession, category: Categories) -> None:
    logger.debug(f"[delete_category]: Soft deleting category {category.name} ({category.id}) for user {category.user_id}")
    category.deleted_at = datetime.now(timezone.utc)
    await db.commit()


def fill_category_brief(category: Categories) -> CategoryBrief:
    if category is not None:
        return CategoryBrief(
            id=category.id,
            name=category.name,
        )
    else:
        return CategoryBrief(
            id=uuid.UUID(int=0),
            name="Transfer",
    )

def fill_category_index(category: Categories) -> CategoryIndex:
    return CategoryIndex(
        id=category.id,
        name=category.name,
        color=category.color,
        parent_id=category.parent_id,
        icon_name=category.icon_name,
        type=category.category_type
    )
