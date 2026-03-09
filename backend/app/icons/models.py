import uuid
from pydantic import BaseModel

class IconInformation(BaseModel):
    id: uuid.UUID
    name: str
    svg_content: str