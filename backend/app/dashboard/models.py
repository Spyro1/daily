import uuid
from typing import Optional
from pydantic import BaseModel
from app.accounts.models import AccountBrief
from app.transactions.models import TransactionBrief

class DashboardIndex(BaseModel):
    accounts: list[AccountBrief]
    transactions: list[TransactionBrief]