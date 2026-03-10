import uuid
from typing import Optional
from pydantic import BaseModel

class AccountIndex(BaseModel):
    id: uuid.UUID
    name: str
    currency_code: str
    icon_svg_content: str
    color: str
    include_in_total: bool
    is_archived: bool

class CreateAccount(BaseModel):
    name: str
    currency_code: str
    icon_svg_content: str
    color: str
    include_in_total: bool

class UpdateAccount(BaseModel):
    name: Optional[str] = None
    currency_code: Optional[str] = None
    icon_svg_content: Optional[str] = None
    color: Optional[str] = None
    include_in_total: Optional[bool] = None
    is_archived: Optional[bool] = None