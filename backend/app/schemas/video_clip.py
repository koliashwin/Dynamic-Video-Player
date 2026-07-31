from typing import Optional, Annotated

from pydantic import BaseModel, ConfigDict, BeforeValidator
from app.models.video_clips import SectionType

# serialize ID (mendatory for cockroachdb)
IdStr = Annotated[str, BeforeValidator(str)]

class ClipOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: IdStr
    title: str
    filename: str
    duration: float


class SectionClipOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: IdStr
    order_index: int
    clip: ClipOut


class SectionCreate(BaseModel):
    title: str
    type: SectionType = SectionType.single


class SectionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: IdStr
    title: str
    type: SectionType
    clip_links: list[SectionClipOut] = []


class AttachClipRequest(BaseModel):
    clip_id: int
    order_index: Optional[int] = None


class FlowCreate(BaseModel):
    name: str
    description: Optional[str] = None


class FlowSectionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: IdStr
    order_index: int
    section: SectionOut


class FlowOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: IdStr
    name: str
    description: Optional[str] = None
    section_links: list[FlowSectionOut] = []


class AttachSectionRequest(BaseModel):
    section_id: int
    order_index: Optional[int] = None