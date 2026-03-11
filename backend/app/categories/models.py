import uuid
from typing import Optional
from decimal import Decimal
from pydantic import BaseModel

class CategoryBrief(BaseModel):
    id: uuid.UUID
    name: str
    
class CategoryIndex(CategoryBrief):
    parent_id: Optional[uuid.UUID] = None
    icon_name: str
    color: Optional[str] = None
    type: str  # "expense" vagy "income"

class CreateCategory(BaseModel):
    name: str
    parent_id: Optional[uuid.UUID] = None
    icon_name: str
    color: Optional[str] = None
    type: str  # "expense" vagy "income"

class UpdateCategory(BaseModel):
    name: Optional[str] = None
    parent_id: Optional[uuid.UUID] = None
    icon_name: Optional[str] = None
    color: Optional[str] = None
    type: Optional[str] = None  # "expense" vagy "income"
