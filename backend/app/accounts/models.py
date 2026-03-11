import uuid
from typing import Optional
from decimal import Decimal
from pydantic import BaseModel

class AccountBrief(BaseModel):
    id: uuid.UUID
    name: str
    currency_code: str

class AccountIndex(AccountBrief):
    balance: Optional[Decimal] = None
    icon_name: str
    color: str
    include_in_total: bool
    is_archived: bool

class CreateAccount(BaseModel):
    name: str
    balance: Optional[Decimal] = None
    currency_code: str
    icon_name: str
    color: str
    include_in_total: bool

class UpdateAccount(BaseModel):
    name: Optional[str] = None
    balance: Optional[Decimal] = None
    currency_code: Optional[str] = None
    icon_name: Optional[str] = None
    color: Optional[str] = None
    include_in_total: Optional[bool] = None
    is_archived: Optional[bool] = None