from pydantic import BaseModel, EmailStr
class ProviderCreate(BaseModel):
    name: str

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    remember_token: str = ""
    
class ProvidedUserCreate(BaseModel):
    provider_user_id: str