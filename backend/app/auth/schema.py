from enum import Enum
from typing import Optional

from pydantic import BaseModel


# ─── Enums ──────────────────────────────────────────────────────────

class TokenType(str, Enum):
    ACCESS_TOKEN = "access_token"
    REFRESH_TOKEN = "refresh_token"


class FlowType(str, Enum):
    LOGIN = "login"


class AuthMethod(str, Enum):
    GOOGLE = "google"


# ─── Models ─────────────────────────────────────────────────────────

class TokenData(BaseModel):
    """JWT payload carried inside access / refresh tokens."""
    user_id: str  # Internal user UUID — the primary principal
    email: Optional[str] = None
    auth_method: str = AuthMethod.GOOGLE.value


class ResponseMessage(BaseModel):
    message: str