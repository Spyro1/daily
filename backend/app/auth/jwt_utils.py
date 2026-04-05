"""
JWT token creation, decoding, and FastAPI dependency helpers.
"""

import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt
from fastapi import Cookie, Depends, HTTPException, status
from jwt.exceptions import InvalidTokenError
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.schema import TokenType
from app.core.config import jwt_config
from app.users.service import get_user_by_id
from db.core import get_db
from db.models import Users

# ─── Configuration ──────────────────────────────────────────────────

SECRET_KEY = jwt_config.secret_key
ALGORITHM = jwt_config.algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = jwt_config.access_token_expire_minutes
REFRESH_TOKEN_EXPIRE_DAYS = jwt_config.refresh_token_expire_days
ISSUER = "https://github.io.spyro1/daily"


# ─── Token creation / decoding ─────────────────────────────────────

def create_token(payload: dict, expires_delta: timedelta) -> str:
    """Create a signed JWT with standard claims (iat, exp, iss)."""
    now = datetime.now(timezone.utc)
    to_encode = {
        **payload,
        "iat": now,
        "exp": now + expires_delta,
        "iss": ISSUER,
    }
    return jwt.encode(payload=to_encode, key=SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    """Decode and verify a JWT, returning the payload dict."""
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])


def create_access_token(payload: dict | None = None) -> str:
    """Create a short-lived access token."""
    to_encode = {
        **(payload or {}),
        "token_type": TokenType.ACCESS_TOKEN.value,
    }
    return create_token(to_encode, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))


def create_refresh_token(payload: dict | None = None) -> str:
    """Create a long-lived refresh token."""
    to_encode = {
        **(payload or {}),
        "token_type": TokenType.REFRESH_TOKEN.value,
    }
    return create_token(to_encode, timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))


# ─── FastAPI dependencies ──────────────────────────────────────────

_CREDENTIALS_EXCEPTION = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


async def get_current_user(
    access_token: Optional[str] = Cookie(None),
    db: AsyncSession = Depends(get_db),
) -> Users:
    """Resolve the authenticated user from the ``access_token`` cookie.

    Raises 401 if the token is missing, invalid, or the user no longer exists.
    """
    if not access_token:
        raise _CREDENTIALS_EXCEPTION

    try:
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str = payload.get("user_id")
        if user_id_str is None:
            raise _CREDENTIALS_EXCEPTION
        user_id = uuid.UUID(user_id_str)
    except (InvalidTokenError, ValidationError, ValueError):
        raise _CREDENTIALS_EXCEPTION

    user = await get_user_by_id(db, user_id, eager_load=True)
    if user is None:
        raise _CREDENTIALS_EXCEPTION
    return user


async def get_optional_current_user(
    access_token: Optional[str] = Cookie(None),
    db: AsyncSession = Depends(get_db),
) -> Optional[Users]:
    """Like ``get_current_user`` but returns ``None`` instead of raising."""
    if not access_token:
        return None
    try:
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str = payload.get("user_id")
        if user_id_str is None:
            return None
        user_id = uuid.UUID(user_id_str)
    except (InvalidTokenError, ValidationError, ValueError):
        return None

    return await get_user_by_id(db, user_id, eager_load=True)
