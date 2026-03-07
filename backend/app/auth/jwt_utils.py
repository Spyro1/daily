# This file was originally written by Kardos Bendegúz who gave permission to use this code.
# Modifications were made by Szenes Márton, but the original code is still present in the file.

from typing import Annotated, Optional
import jwt
from jwt.exceptions import InvalidTokenError
from app.auth.models import TokenData, TokenType
import secrets
from fastapi.security import OAuth2AuthorizationCodeBearer, SecurityScopes
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends, HTTPException, status, Security, Cookie
from datetime import datetime, timedelta, timezone
from db.core import get_db
from db.models import Users
from app.users.services import get_user_by_email
from app.core.config import jwt_config
from pydantic import ValidationError
from loguru import logger


# JWT Configuration
SECRET_KEY = jwt_config.secret_key
ALGORITHM = jwt_config.algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = jwt_config.access_token_expire_minutes
REFRESH_TOKEN_EXPIRE_DAYS = jwt_config.refresh_token_expire_days

# jwt state for auth providers
def create_token(payload: dict, expires_delta: timedelta) -> str:
    now = datetime.now(timezone.utc)
    to_encode = {
        **payload,
        "iat": now,
        "exp": now + expires_delta,
        "iss": 'https://github.io.spyro1/daily'
    }
    return jwt.encode(payload=to_encode, key=SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])


# basic stuff for jwt
def create_access_token(payload: dict = {}) -> str:
    to_encode = {
        **payload,
        "token_type": TokenType.ACCESS
    }
    return create_token(to_encode, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))

def create_refresh_token(payload: dict = {}) -> str:
    to_encode = {
        **payload,
        "token_type": TokenType.REFRESH
    }
    return create_token(to_encode, timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))

async def get_current_user(access_token: Optional[str] = Cookie(None), db: AsyncSession = Depends(get_db)) -> Users:

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Auth error."},
    )

    if not access_token:
        raise credentials_exception

    try:
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        sub = payload.get('sub')
        email = payload.get('email')
        if sub is None or email is None:
            raise credentials_exception
        token_data = TokenData(sub=sub, email = email)
    except (InvalidTokenError, ValidationError):
        raise credentials_exception
    user = await get_user_by_email(db, token_data.email)
    if user is None:
        raise credentials_exception
    return user
