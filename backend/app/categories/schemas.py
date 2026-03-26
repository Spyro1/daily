import uuid
from typing import Optional
from pydantic import BaseModel
from enum import Enum

class CategoryType(str, Enum):
    EXPENSE = "expense"
    INCOME = "income"

class CategoryBrief(BaseModel):
    id: uuid.UUID
    name: str
    
class CategoryIndex(CategoryBrief):
    parent_id: Optional[uuid.UUID] = None
    icon_name: str
    color: Optional[str] = None
    type: CategoryType

class CreateCategory(BaseModel):
    name: str
    parent_id: Optional[uuid.UUID] = None
    icon_name: str
    color: Optional[str] = None
    type: CategoryType

class UpdateCategory(BaseModel):
    name: Optional[str] = None
    parent_id: Optional[uuid.UUID] = None
    icon_name: Optional[str] = None
    color: Optional[str] = None
    type: Optional[CategoryType] = None
