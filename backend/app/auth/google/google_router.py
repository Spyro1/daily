# This file was originally written by Kardos Bendegúz who gave permission to use this code. 
# Modifications were made by Szenes Márton, but the original code is still present in the file.

from datetime import timedelta
from urllib.parse import urlencode

from fastapi import APIRouter
from fastapi.responses import RedirectResponse

from app.auth.jwt_utils import create_token
from app.core.config import google_config, jwt_config

CLIENT_ID = google_config.client_id
REDIRECT_URI = google_config.redirect_uri
    
router = APIRouter()    

@router.get("/login")
async def google_login():
    state = create_token({"provider": "google"}, expires_delta=timedelta(minutes=jwt_config.login_token_expire_minutes))
    query = urlencode(
        {
            "client_id": CLIENT_ID,
            "redirect_uri": REDIRECT_URI,
            "response_type": "code",
            "state": state,
            "scope": "openid profile email",
            "access_type": "offline",
            "prompt": "consent",
        }
    )
    return RedirectResponse(url=f"https://accounts.google.com/o/oauth2/v2/auth?{query}", status_code=302)
