import uuid

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from db.models import ProvidedUsers, Users, Providers
from app.users.models import ProvidedUserCreate, UserCreate, ProviderCreate
from loguru import logger


def _get_user_eager_load_options():
    return (selectinload("*"),)

# JWT functions

async def get_provided_user_by_sub(db: AsyncSession, sub: str):
    logger.debug(f"[users/get_provided_user_by_sub]: start sub={sub}")
    try:
        provided_user = (
            await db.scalars(
                select(ProvidedUsers).where(
                    ProvidedUsers.provider_user_id == sub,
                    ProvidedUsers.deleted_at.is_(None),
                )
            )
        ).first()
    except Exception as exc:
        logger.exception(f"[users/get_provided_user_by_sub]: error sub={sub}: {exc}")
        raise

    logger.debug(f"[users/get_provided_user_by_sub]: found={provided_user is not None} sub={sub}")
    return provided_user

async def get_user_by_email(db: AsyncSession, email: str) -> Users | None:
    logger.debug(f"[users/get_user_by_email]: start email={email}")
    try:
        db_user = (
            await db.scalars(
                select(Users)
                .where(Users.email == email, Users.deleted_at.is_(None))
                .options(*_get_user_eager_load_options())
            )
        ).first()
    except Exception as exc:
        logger.exception(f"[users/get_user_by_email]: error email={email}: {exc}")
        raise

    logger.debug(f"[users/get_user_by_email]: found={db_user is not None} email={email}")
    return db_user


async def get_or_create_user(db: AsyncSession, user: UserCreate, avatar_url: str | None = None) -> Users:
    logger.debug(f"[users/get_or_create_user]: start email={user.email}")
    db_user = await get_user_by_email(db, str(user.email))

    if db_user:
        logger.debug(f"[users/get_or_create_user]: existing user found id={db_user.id}")
        db_user.display_name = user.name or db_user.display_name
        if avatar_url:
            db_user.avatar_url = avatar_url
        await db.commit()
        await db.refresh(db_user)
        logger.debug(f"[users/get_or_create_user]: existing user updated id={db_user.id}")
        return db_user

    db_user = Users(
        id=uuid.uuid4(),
        display_name=user.name,
        email=str(user.email),
        avatar_url=avatar_url,
    )

    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    logger.info(f"[users/get_or_create_user]: created user id={db_user.id}")
    return db_user


# == provider functions ==

async def get_providers(db: AsyncSession) -> list[Providers]:
    logger.debug("[users/get_providers]: start")
    try:
        providers = (await db.scalars(select(Providers).where(Providers.deleted_at.is_(None)))).all()
    except Exception as exc:
        logger.exception(f"[users/get_providers]: error: {exc}")
        raise

    logger.debug(f"[users/get_providers]: returning {len(providers)} providers")
    return providers


async def get_provider_by_name(db: AsyncSession, name: str) -> Providers | None:
    logger.debug(f"[users/get_provider_by_name]: start name={name}")
    try:
        provider = (
            await db.scalars(
                select(Providers).where(
                    Providers.name == name,
                    Providers.deleted_at.is_(None),
                )
            )
        ).first()
    except Exception as exc:
        logger.exception(f"[users/get_provider_by_name]: error name={name}: {exc}")
        raise

    logger.debug(f"[users/get_provider_by_name]: found={provider is not None} name={name}")
    return provider


async def get_or_create_provider(
    db: AsyncSession,
    provider: ProviderCreate,
) -> Providers:
    logger.debug(f"[users/get_or_create_provider]: start name={provider.name}")
    db_provider = await get_provider_by_name(db, provider.name)

    if db_provider:
        logger.debug(f"[users/get_or_create_provider]: existing provider id={db_provider.id}")
        return db_provider

    db_provider = Providers(
        name=provider.name,
        is_enabled=True,
    )
    db.add(db_provider)
    await db.commit()
    await db.refresh(db_provider)
    logger.info(f"[users/get_or_create_provider]: created provider id={db_provider.id}")
    return db_provider


async def get_or_create_provided_user(
    db: AsyncSession,
    provider: ProviderCreate,
    user: UserCreate,
    provided_user: ProvidedUserCreate,
    avatar_url: str | None = None,
) -> ProvidedUsers:
    logger.debug("[users/get_or_create_provided_user]: start")
    db_user = await get_or_create_user(db, user, avatar_url=avatar_url)
    db_provider = await get_or_create_provider(db, provider)


    db_provided_user = await get_provided_user_by_ids(db, db_user.id, db_provider.id)

    if db_provided_user:
        logger.debug(f"[users/get_or_create_provided_user]: existing mapping id={db_provided_user.id} user_id={db_user.id} provider_id={db_provider.id}")
        return db_provided_user

    db_provided_user = ProvidedUsers(
        id=uuid.uuid4(),
        user_id=db_user.id,
        provider_id=db_provider.id,
        provider_user_id=provided_user.provider_user_id,
    )
    db.add(db_provided_user)

    await db.commit()
    await db.refresh(db_provided_user)
    logger.info(f"[users/get_or_create_provided_user]: created mapping id={db_provided_user.id} user_id={db_user.id} provider_id={db_provider.id}")
    return db_provided_user


# == ProvidedUsers functions ==

async def get_provided_user_by_ids(db: AsyncSession, user_id: uuid.UUID, provider_id: uuid.UUID):
    logger.debug(f"[users/get_provided_user_by_ids]: start user_id={user_id} provider_id={provider_id}")
    try:
        provided_user = (
            await db.scalars(
                select(ProvidedUsers).where(
                    ProvidedUsers.user_id == user_id,
                    ProvidedUsers.provider_id == provider_id,
                    ProvidedUsers.deleted_at.is_(None),
                )
            )
        ).first()
    except Exception as exc:
        logger.exception(f"[users/get_provided_user_by_ids]: error user_id={user_id} provider_id={provider_id}: {exc}")
        raise

    logger.debug(
        f"[users/get_provided_user_by_ids]: found={provided_user is not None} user_id={user_id} provider_id={provider_id}"
    )
    return provided_user


# == user functions ==

async def get_users(db: AsyncSession):
    logger.debug("[users/get_users]: start")
    try:
        users = (await db.scalars(select(Users).where(Users.deleted_at.is_(None)))).all()
    except Exception as exc:
        logger.exception(f"[users/get_users]: error: {exc}")
        raise

    logger.debug(f"[users/get_users]: returning {len(users)} users")
    return users


async def get_user_by_id(db: AsyncSession, id: uuid.UUID, eager_load = False):
    logger.debug(f"[users/get_user_by_id]: start id={id} eager_load={eager_load}")
    try:
        if eager_load:
            user = (
                await db.scalars(
                    select(Users).where(Users.id == id, Users.deleted_at.is_(None)).options(*_get_user_eager_load_options())
                )
            ).first()
        else:
            user = (await db.scalars(select(Users).where(Users.id == id, Users.deleted_at.is_(None)))).first()
    except Exception as exc:
        logger.exception(f"[users/get_user_by_id]: error id={id} eager_load={eager_load}: {exc}")
        raise

    logger.debug(f"[users/get_user_by_id]: found={user is not None} id={id} eager_load={eager_load}")
    return user
