import uuid
from typing import Optional
from decimal import Decimal
from pydantic import BaseModel

from app.accounts.models import AccountBrief
from app.categories.models import CategoryBrief


class TransactionIndex(BaseModel):
    id: uuid.UUID
    source_account: Optional[AccountBrief] = None
    destination_account: Optional[AccountBrief] = None
    category: CategoryBrief
    amount: Decimal
    target_amount: Optional[Decimal] = None
    transaction_type: str  # "income", "expense", "transfer"
    date: str  # ISO format date string
    note: Optional[str] = None


class CreateTransaction(BaseModel):
    pass

class UpdateTransaction(BaseModel):
    pass