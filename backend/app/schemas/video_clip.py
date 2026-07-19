from typing import Optional

from pydantic import BaseModel, ConfigDict
from app.models.video_clips import SectionType

class ClipOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    filename: str
    duration: float


class SectionCreate(BaseModel):
    title: str
    type: SectionType = SectionType.single
    order_index: Optional[int] = None


class SectionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    type: SectionType
    order_index: int


class AttachClipRequest(BaseModel):
    clip_id: int
    order_index: Optional[int] = None