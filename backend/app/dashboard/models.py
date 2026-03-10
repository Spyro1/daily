import uuid
from typing import Optional
from pydantic import BaseModel
from app.accounts.models import AccountIndex

class DashboardIndex(BaseModel):
    accounts: list[AccountIndex]