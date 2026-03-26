import uuid
from typing import Optional
from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel
from enum import Enum

from backend.app.accounts.schemas import AccountBrief
from backend.app.categories.schemas import CategoryBrief


class TransactionType(str, Enum):
    EXPENSE = "expense"
    INCOME = "income"
    TRANSFER = "transfer"


class TransactionBrief(BaseModel):
    id: uuid.UUID
    amount: Decimal
    transaction_type: TransactionType
    category: CategoryBrief
    occurred_at: datetime


class TransactionIndex(TransactionBrief):
    source_account: Optional[AccountBrief] = None
    destination_account: Optional[AccountBrief] = None
    target_amount: Optional[Decimal] = None
    note: Optional[str] = None


class CreateTransaction(BaseModel):
    amount: Decimal
    transaction_type: TransactionType
    occurred_at: datetime
    category_id: uuid.UUID
    source_account_id: Optional[uuid.UUID] = None
    destination_account_id: Optional[uuid.UUID] = None
    target_amount: Optional[Decimal] = None
    note: Optional[str] = None


class UpdateTransaction(BaseModel):
    amount: Optional[Decimal] = None
    transaction_type: Optional[TransactionType] = None
    occurred_at: Optional[datetime] = None
    category_id: Optional[uuid.UUID] = None
    source_account_id: Optional[uuid.UUID] = None
    destination_account_id: Optional[uuid.UUID] = None
    target_amount: Optional[Decimal] = None
    note: Optional[str] = None


class TransactionListResponse(BaseModel):
    data: list[TransactionIndex]
    total: int
    skip: int
    limit: int