import uuid
from typing import Optional
from decimal import Decimal
from pydantic import BaseModel
from enum import Enum

from app.accounts.models import AccountBrief
from app.categories.models import CategoryBrief

class TransactionType(str, Enum):
    EXPANSE = "expanse",
    INCOME = "income",
    TRANSFER = "transfer"

class TransactionBrief(BaseModel):
    id: uuid.UUID
    amount: Decimal
    transaction_type: TransactionType
    category: CategoryBrief
    date: str  # ISO format date string

class TransactionIndex(TransactionBrief):
    source_account: Optional[AccountBrief] = None
    destination_account: Optional[AccountBrief] = None
    target_amount: Optional[Decimal] = None
    note: Optional[str] = None


class CreateTransaction(BaseModel):
    amount: Decimal
    transaction_type: TransactionType
    category_id: uuid.UUID
    date: str  # ISO format date string
    source_account_id: Optional[uuid.UUID] = None
    destination_account_id: Optional[uuid.UUID] = None
    target_amount: Optional[Decimal] = None
    note: Optional[str] = None

class UpdateTransaction(BaseModel):
    amount: Optional[Decimal] = None
    transaction_type: Optional[TransactionType] = None
    category_id: Optional[uuid.UUID] = None
    date: Optional[str] = None  # ISO format date string
    source_account_id: Optional[uuid.UUID] = None
    destination_account_id: Optional[uuid.UUID] = None
    target_amount: Optional[Decimal] = None
    note: Optional[str] = None