from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.video_clips import Section, Clip, SectionClip
from app.schemas.video_clip import SectionCreate, SectionOut, AttachClipRequest
from app.services.auth import require_current_user_id
from app.services.vault_service import ger_or_create_default_vault

router = APIRouter(prefix='/sections', tags=["sections"])

@router.get("", response_model=list[SectionOut])
def list_sections(
    db: Session = Depends(get_db),
    user_id: str = Depends(require_current_user_id)
):
    return (
        db.query(Section)
        .filter(Section.owner_id == user_id)
        .order_by(Section.id)
        .all()
    )

@router.post("", response_model=SectionOut)
def create_section(
    payload: SectionCreate, 
    db: Session = Depends(get_db),
    user_id: str = Depends(require_current_user_id)
):
    vault = ger_or_create_default_vault(db, user_id)
    section = Section(title=payload.title, type=payload.type, owner_id=user_id, vault_id=vault.id)
    db.add(section)
    db.commit()
    db.refresh(section)

    return section

@router.post("/{section_id}/clips")
def attach_clip(
    section_id: int, 
    payload: AttachClipRequest, 
    db: Session = Depends(get_db),
    user_id: str = Depends(require_current_user_id)
):
    section = (
        db.query(Section)
        .filter(Section.id == section_id, Section.owner_id == user_id)
        .first()
    )

    if not section:
        raise HTTPException(status_code=404, detail='Section not found')

    # check if the clip attached to the section is actually belong to
    # same logged in user
    clip = (
        db.query(Clip)
        .filter(Clip.id == payload.clip_id, Clip.owner_id == user_id)
        .first()
    )
    if not clip:
        raise HTTPException(status_code=404, detail='Clip not found')

    already_attached = (
        db.query(SectionClip)
        .filter(SectionClip.section_id == section_id, SectionClip.clip_id == clip.id)
        .first()
    )
    if already_attached:
        raise HTTPException(status_code=400, detail=f"'{clip.title}' is already attached to this section")
    
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
def detach_clip(
    section_id: int, 
    link_id: int, 
    force: bool = False, 
    db: Session = Depends(get_db),
    user_id: str = Depends(require_current_user_id)
):
    link = db.get(SectionClip, link_id)

    if not link or link.section_id != section_id or link.section.owner_id != user_id:
        raise HTTPException(status_code=404, detail='Attachment not Found')

    section = link.section
    is_last_clip = len(section.clip_links) <= 1

    if is_last_clip and not force:
        affected_flows = [flow_link.flow.name for flow_link in section.flow_links]
        if affected_flows:
            raise HTTPException(
                status_code=409,
                detail=(
                    f"Removing this clip will leave '{section.title}' empty, "
                    f"breaking : {', '.join(affected_flows)}"
                )
            )

    unpublished = []
    if is_last_clip:
        for flow_link in section.flow_links:
            if flow_link.flow.is_published:
                flow_link.flow.is_published = False
                unpublished.append(flow_link.flow.name)

    db.delete(link)
    db.commit()

    return{'detached': link_id, 'section_id': section_id, 'unpublished_flows': unpublished}

@router.delete('/{section_id}')
def delete_section(
    section_id: int, 
    force: bool = False, 
    db: Session = Depends(get_db),
    user_id: str = Depends(require_current_user_id)
):
    section = (
        db.query(Section)
        .filter(Section.owner_id == user_id, Section.id == section_id)
        .first()
    )
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")

    if not force:
        affected_flows = [
            flow_link.flow.name
            for flow_link in section.flow_links
            if len(flow_link.flow.section_links) <= 1
        ]
        if affected_flows:
            noun = 'flow' if len(affected_flows) == 1 else 'flows'
            raise HTTPException(
                status_code=409,
                detail=(
                    f"'{section.title}' is the only section in {', '.join(affected_flows)}."
                    f"Deleting it will leave that {noun} empty and unplayable."
                )
            )

    unpublished = []
    for flow_link in section.flow_links: 
        if len(flow_link.flow.section_links) <= 1 and flow_link.flow.is_published:
            flow_link.flow.is_published = False
            unpublished.append(flow_link.flow.name)

    db.delete(section)
    db.commit()

    return {"deleted": section_id, "unpublished_flows": unpublished}