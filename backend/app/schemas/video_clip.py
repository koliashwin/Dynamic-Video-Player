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


class SectionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    type: SectionType


class AttachClipRequest(BaseModel):
    clip_id: int
    order_index: Optional[int] = None


class FlowCreate(BaseModel):
    name: str
    description: Optional[str] = None


class FlowOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: Optional[str] = None


class AttachSectionRequest(BaseModel):
    section_id: int
    order_index: Optional[int] = None