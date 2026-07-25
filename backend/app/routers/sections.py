from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.video_clips import Section, Clip, SectionClip
from app.schemas.video_clip import SectionCreate, SectionOut, AttachClipRequest

router = APIRouter(prefix='/sections', tags=["sections"])

@router.get("", response_model=list[SectionOut])
def list_sections(db: Session = Depends(get_db)):
    return db.query(Section).order_by(Section.id).all()

@router.post("", response_model=SectionOut)
def create_section(payload: SectionCreate, db: Session = Depends(get_db)):
    section = Section(title=payload.title, type=payload.type)
    db.add(section)
    db.commit()
    db.refresh(section)

    return section

@router.post("/{section_id}/clips")
def attach_clip(section_id: int, payload: AttachClipRequest, db: Session = Depends(get_db)):
    section = db.get(Section, section_id)

    if not section:
        raise HTTPException(status_code=404, detail='Section not found')
    
    clip = db.get(Clip, payload.clip_id)
    if not clip:
        raise HTTPException(status_code=404, detail='Clip not found')
    
    order_index = payload.order_index
    if order_index is None:
        max_order = (
            db.query(func.max(SectionClip.order_index))
            .filter(SectionClip.section_id == section_id)
            .scalar()
        )
        order_index = (max_order if max_order is not None else -1) + 1
    
    link = SectionClip(section_id=section_id, clip_id=clip.id, order_index=order_index)
    db.add(link)
    db.commit()

    return {'attached': True, 'section_id': section_id, 'clip_id': clip.id}

@router.delete('/{section_id}/clips/{link_id}')
def detach_clip(section_id: int, link_id: int, db: Session = Depends(get_db)):
    link = db.get(SectionClip, link_id)

    if not link or link.section_id != section_id:
        raise HTTPException(status_code=404, detail='Attachment not Found')
    
    db.delete(link)
    db.commit()

    return{'detached': link_id, 'section_id': section_id}

@router.delete('/{section_id}')
def delete_section(section_id: int, db: Session = Depends(get_db)):
    section = db.get(Section, section_id)
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    db.delete(section)
    db.commit()

    return {"deleted": section_id}