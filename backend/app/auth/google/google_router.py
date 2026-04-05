"""Google OAuth login redirect endpoint."""

from datetime import timedelta
from urllib.parse import urlencode

from fastapi import APIRouter
from fastapi.responses import RedirectResponse
from loguru import logger

from app.auth.jwt_utils import create_token
from app.auth.schema import AuthMethod, FlowType
from app.core.config import google_config, jwt_config

_GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"

router = APIRouter()


def _build_google_auth_query(state_token: str) -> str:
    """Build the Google OAuth authorization URL query string."""
    return urlencode(
        {
            "client_id": google_config.client_id,
            "redirect_uri": google_config.redirect_uri,
            "response_type": "code",
            "state": state_token,
            "scope": "openid profile email",
            "access_type": "offline",
            "prompt": "consent",
        }
    )


@router.get("/login")
async def google_login():
    """Redirect the user to Google's OAuth consent screen."""
    logger.info("[google/login]: Starting Google OAuth login redirect")
    state = create_token(
        {"provider": AuthMethod.GOOGLE.value, "flow_type": FlowType.LOGIN.value},
        expires_delta=timedelta(minutes=jwt_config.login_token_expire_minutes),
    )
    query = _build_google_auth_query(state)
    return RedirectResponse(url=f"{_GOOGLE_AUTH_URL}?{query}", status_code=302)
