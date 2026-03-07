# This file was originally written by Kardos Bendegúz who gave permission to use this code.

from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum

# JWT token schemas
class TokenType(str, Enum):
    ACCESS = "access"
    REFRESH = "refresh"

class TokenData(BaseModel):
    sub: str
    email: EmailStr
 
class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = 'bearer' 
