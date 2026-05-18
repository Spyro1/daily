# Pydantic schemas for user-related operations.
from pydantic import BaseModel, EmailStr


class ProviderCreate(BaseModel):
    name: str


class UserCreate(BaseModel):
    name: str
    email: EmailStr


class ProvidedUserCreate(BaseModel):
    provider_user_id: str