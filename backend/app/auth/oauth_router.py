# This file was originally written by Kardos Bendeguz who gave permission to use this code. Modified by Szenes Marton.
from datetime import datetime
from typing import Any, Dict, Optional
import uuid

import httpx
from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response, status
from fastapi.responses import RedirectResponse
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.jwt_utils import create_access_token, create_refresh_token, decode_token, get_current_user
from app.auth.models import ResponseMessage, TokenData, TokenType
from app.core.config import frontend_config, google_config, jwt_config
from app.users.models import UserCreate, ProviderCreate, ProvidedUserCreate
from app.users.services import get_or_create_provided_user, get_provided_user_by_sub
from db.models import Users
from db.core import get_db

router = APIRouter()

ACCESS_TOKEN_EXPIRE_MINUTES = jwt_config.access_token_expire_minutes
REFRESH_TOKEN_EXPIRE_DAYS = jwt_config.refresh_token_expire_days

PROVIDER_CONFIGS: Dict[str, Any] = {
    "google": google_config,
}


def _cookie_options() -> dict[str, Any]:
    return {
        "httponly": True,
        "secure": False, # Set to True if your app is served over HTTPS in production
        "samesite": "lax",
        "path": "/",
    }


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(response: Response):
    logger.info("[oauth/logout]: Clearing auth cookies")
    cookie_options = _cookie_options()
    response.delete_cookie(key=TokenType.ACCESS_TOKEN.value, **cookie_options)
    response.delete_cookie(key=TokenType.REFRESH_TOKEN.value, **cookie_options)


@router.post("/validate", response_model=ResponseMessage)
async def validate_access_token(
    response: Response,
    access_token: Optional[str] = Cookie(None),
    db: AsyncSession = Depends(get_db)
):
    request_id = str(uuid.uuid4())[:8]

    logger.info(f"[{request_id}][oauth/validate]: Validating access token")

    if not access_token:
        logger.warning(f"[{request_id}][oauth/validate]: Missing access token cookie")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Access token not found")
    
    try:
        data = decode_token(access_token)
        logger.debug(f"[{request_id}][oauth/validate]: Access token decoded for sub={data.get('sub')}")
        logger.debug(f"[{request_id}][oauth/validate]: Access token payload: {data}")
    except Exception:
        logger.exception(f"[{request_id}][oauth/validate]: Failed to decode access token")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired access token")
    
    provided_user = await get_provided_user_by_sub(db, data["sub"])
    
    if not provided_user:
        logger.warning(f"[{request_id}][oauth/validate]: No provided user found for sub={data.get('sub')}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    logger.info(f"[{request_id}][oauth/validate]: Access token is valid for user sub={data.get('sub')}")
    return ResponseMessage(message="Access token is valid")


@router.post("/refresh", response_model=ResponseMessage)
async def refresh_access_token(
    response: Response,
    refresh_token: Optional[str] = Cookie(None),
    db: AsyncSession = Depends(get_db),
):
    request_id = str(uuid.uuid4())[:8]
    logger.info(f"[{request_id}][oauth/token]: Refresh token exchange started")

    if not refresh_token:
        logger.warning(f"[{request_id}][oauth/token]: Missing refresh token cookie")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        data = decode_token(refresh_token)
        logger.debug(f"[{request_id}][oauth/token]: Refresh token decoded for sub={data.get('sub')}")
        logger.debug(f"[{request_id}][oauth/token]: Refresh token payload: {data}")
    except Exception:
        logger.exception(f"[{request_id}][oauth/token]: Failed to decode refresh token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    provided_user = await get_provided_user_by_sub(db, data["sub"])
    if not provided_user:
        logger.warning(f"[{request_id}][oauth/token]: No provided user found for sub={data.get('sub')}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    payload = TokenData(
        sub= data["sub"], 
        email= data["email"]
    )

    new_access = create_access_token(dict(payload))
    cookie_options = _cookie_options()

    response.set_cookie(
        key=TokenType.ACCESS_TOKEN.value,
        value=new_access,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        **cookie_options,
    )
    logger.info(f"[{request_id}][oauth/token]: Access token refreshed successfully")
    return ResponseMessage(message="Access token refreshed successfully")


@router.get("/token", response_model=str)
async def get_access_token_string(
    current_user: Users = Depends(get_current_user),
    access_token: Optional[str] = Cookie(None),
) -> str:
    logger.info(f"[oauth/token]: Generating access token string for user_id={current_user.id}")
    try:
        original_payload = decode_token(access_token)  # already validated by get_current_user
        data = TokenData(
            email=current_user.email,
            sub=original_payload["sub"],
        )
        new_access_token = create_access_token(payload=data.model_dump())
    except Exception as exc:
        logger.exception(f"[oauth/token]: Failed to create access token for user_id={current_user.id}: {exc}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create access token")

    return new_access_token

@router.get("/callback")
async def oauth_callback(
    code: str,
    state: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    request_id = str(uuid.uuid4())[:8]
    logger.info(f"[{request_id}][oauth/callback]: Started callback handling")

    try:
        state_data = decode_token(state)
    except Exception:
        logger.exception(f"[{request_id}][oauth/callback]: Invalid state token")
        raise HTTPException(status_code=400, detail="Invalid or expired state token")

    issued_at = state_data["iat"]
    provider = state_data["provider"]
    logger.info(f"[{request_id}][oauth/callback]: OAuth state generated at {datetime.fromtimestamp(issued_at)}")
    logger.info(f"[{request_id}][oauth/callback]: OAuth provider={provider}")

    config = PROVIDER_CONFIGS.get(provider)
    if not config:
        logger.error(f"[{request_id}][oauth/callback]: Provider config missing for provider={provider}")
        raise HTTPException(status_code=404, detail="Provider not found")

    token_payload = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": config.redirect_uri,
        "client_id": config.client_id,
        "client_secret": config.client_secret,
    }
    headers = {"Accept": "application/json"}

    async with httpx.AsyncClient(timeout=15.0) as client:
        logger.info(f"[{request_id}][oauth/callback]: Exchanging auth code at {config.token_url}")
        try:
            token_response = await client.post(config.token_url, data=token_payload, headers=headers)
            token_response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            logger.exception(f"[{request_id}][oauth/callback]: Token endpoint HTTP error status={exc.response.status_code} body={exc.response.text}")
            raise HTTPException(status_code=502, detail="OAuth token endpoint returned an error")
        except httpx.RequestError as exc:
            logger.exception(f"[{request_id}][oauth/callback]: Token endpoint request failed: {exc}")
            raise HTTPException(status_code=502, detail="OAuth token endpoint is unreachable")

        token_json = token_response.json()
        logger.debug(f"[{request_id}][oauth/callback]: Token response keys={list(token_json.keys())}")
        logger.debug(f"[{request_id}][oauth/callback]: Token response payload: {token_json}")

        if "error" in token_json:
            logger.error(f"[{request_id}][oauth/callback]: OAuth token error payload={token_json}")
            error_msg = token_json.get("error_description", token_json.get("error", "Unknown OAuth error"))
            raise HTTPException(status_code=400, detail=f"OAuth token exchange failed: {error_msg}")

        access_token = token_json[TokenType.ACCESS_TOKEN.value]
        logger.debug(f"[{request_id}][oauth/callback]: Access token acquired")

        userinfo_headers = {
            "Accept": "application/json",
            "Authorization": f"Bearer {access_token}",
        }
        logger.info(f"[{request_id}][oauth/callback]: Fetching userinfo from {config.userinfo_url}")
        try:
            userinfo_response = await client.get(config.userinfo_url, headers=userinfo_headers)
            userinfo_response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            logger.exception(
                f"[{request_id}][oauth/callback]: Userinfo endpoint HTTP error status={exc.response.status_code} body={exc.response.text}"
            )
            raise HTTPException(status_code=502, detail="OAuth userinfo endpoint returned an error")
        except httpx.RequestError as exc:
            logger.exception(f"[{request_id}][oauth/callback]: Userinfo endpoint request failed: {exc}")
            raise HTTPException(status_code=502, detail="OAuth userinfo endpoint is unreachable")

        userinfo_json = userinfo_response.json()
        logger.debug(f"[{request_id}][oauth/callback]: Userinfo response keys={list(userinfo_json.keys())}")

    if "error" in userinfo_json:
        logger.error(f"[{request_id}][oauth/callback]: OAuth userinfo error payload={userinfo_json}")
        error_msg = userinfo_json.get("error_description", userinfo_json.get("error", "Unknown OAuth error"))
        raise HTTPException(status_code=400, detail=f"OAuth userinfo fetch failed: {error_msg}")

    provider_user_id = userinfo_json.get("sub") or userinfo_json.get("id")
    if not provider_user_id:
        logger.error(f"[{request_id}][oauth/callback]: Provider user id missing from userinfo payload")
        raise HTTPException(status_code=400, detail="Provider user id is missing from userinfo")

    email = str(userinfo_json.get("email", ""))
    display_name = str(userinfo_json.get("name") or userinfo_json.get("given_name") or email)
    avatar_url = userinfo_json.get("picture") or None

    if not email:
        logger.error(f"[{request_id}][oauth/callback]: Email missing from userinfo payload")
        raise HTTPException(status_code=400, detail="Email is required from OAuth provider")

    data = TokenData(sub=provider_user_id, email=email)

    to_db_provided_user = ProvidedUserCreate(provider_user_id=provider_user_id)
    to_db_user = UserCreate(name=display_name, email=email)
    to_db_provider = ProviderCreate(name=provider)

    try:
        logger.info(f"[{request_id}][oauth/callback]: Persisting oauth user sub={provider_user_id} email={email}")
        await get_or_create_provided_user(
            db=db,
            provider=to_db_provider,
            user=to_db_user,
            provided_user=to_db_provided_user,
            avatar_url=avatar_url,
        )
        logger.info(f"[{request_id}][oauth/callback]: OAuth user persisted successfully")
    except Exception as exc:
        logger.exception(f"[{request_id}][oauth/callback]: Failed to persist oauth user: {exc}")
        raise HTTPException(status_code=500, detail="Failed to save oauth user to the database")

    access_token = create_access_token(payload=dict(data))
    refresh_token = create_refresh_token(payload=dict(data))

    logger.info(f"[{request_id}][oauth/callback]: Tokens created successfully: access_token: {access_token}, refresh_token: {refresh_token}")

    redirect_route = frontend_config.auth_callback
    if not redirect_route:
        logger.error(f"[{request_id}][oauth/callback]: frontend_auth_callback is empty")
        raise HTTPException(status_code=500, detail="Redirect route incorrect! Contact the site administrator.")

    redirect_response = RedirectResponse(url=redirect_route, status_code=302)
    cookie_options = _cookie_options()
    redirect_response.set_cookie(
        key=TokenType.ACCESS_TOKEN.value,
        value=access_token,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        **cookie_options,
    )
    redirect_response.set_cookie(
        key=TokenType.REFRESH_TOKEN.value,
        value=refresh_token,
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        **cookie_options,
    )

    logger.debug(f"[{request_id}][oauth/callback]: Redirecting to frontend callback: {redirect_route}")
    return redirect_response
