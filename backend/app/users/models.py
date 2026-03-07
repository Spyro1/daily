from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum

class ProviderCreate(BaseModel):
    name: str

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    remember_token: str = ""
    
class ProvidedUserCreate(BaseModel):
    provider_user_id: str