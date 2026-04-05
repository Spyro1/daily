"""Schemas for the one-time sync push from frontend IndexedDB to backend."""

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field


class SyncAccount(BaseModel):
    """An account coming from the frontend's local storage."""
    id: uuid.UUID
    name: str
    currency_code: str = Field(pattern=r"^[A-Z]{3}$")
    icon_name: str = "Savings"
    color: Optional[str] = Field(default=None, pattern=r"^#[0-9A-Fa-f]{6}$")
    include_in_total: bool = True
    is_archived: bool = False


class SyncCategory(BaseModel):
    """A category coming from the frontend's local storage."""
    id: uuid.UUID
    parent_id: Optional[uuid.UUID] = None
    name: str
    category_type: str = Field(pattern=r"^(expense|income)$")
    icon_name: str = "Savings"
    color: Optional[str] = Field(default=None, pattern=r"^#[0-9A-Fa-f]{6}$")


class SyncTransaction(BaseModel):
    """A transaction coming from the frontend's local storage."""
    id: uuid.UUID
    source_account_id: Optional[uuid.UUID] = None
    destination_account_id: Optional[uuid.UUID] = None
    category_id: Optional[uuid.UUID] = None
    transaction_type: str = Field(pattern=r"^(income|expense|transfer)$")
    amount: Decimal = Field(gt=0)
    target_amount: Optional[Decimal] = None
    occurred_at: datetime
    note: Optional[str] = None


class SyncPushRequest(BaseModel):
    """
    One-time bulk upload of locally-stored data after the user authenticates
    via Google.  The frontend sends everything from IndexedDB; the backend
    persists it under the authenticated user's id.
    """
    accounts: list[SyncAccount] = []
    categories: list[SyncCategory] = []
    transactions: list[SyncTransaction] = []


class SyncPushResponse(BaseModel):
    accounts_created: int = 0
    categories_created: int = 0
    transactions_created: int = 0
    message: str = "Sync push completed"
