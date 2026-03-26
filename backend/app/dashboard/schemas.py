import uuid
from typing import Optional
from pydantic import BaseModel
from app.accounts.schemas import AccountBrief
from app.transactions.schemas import TransactionBrief

class DashboardIndex(BaseModel):
    accounts: list[AccountBrief]
    transactions: list[TransactionBrief]