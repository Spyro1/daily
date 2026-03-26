import uuid
from typing import Optional
from pydantic import BaseModel
from backend.app.accounts.schemas import AccountBrief
from backend.app.transactions.schemas import TransactionBrief

class DashboardIndex(BaseModel):
    accounts: list[AccountBrief]
    transactions: list[TransactionBrief]