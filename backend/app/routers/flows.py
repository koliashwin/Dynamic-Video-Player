from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.video_clips import Flow, Section, FlowSection
from app.schemas.video_clip import FlowCreate, FlowOut, AttachSectionRequest
from app.services.video_service import get_flow_playability_error
from app.services.auth import require_current_user_id

router = APIRouter(prefix='/flows', tags=['flows'])

@router.get("", response_model=list[FlowOut])
def list_flows(
    db: Session = Depends(get_db),
    user_id: str = Depends(require_current_user_id)
):
    """Owner-scoped. the config panel's 'my flows' list. Requires auth. list all flows"""
    return (
        db.query(Flow)
        .filter(Flow.owner_id == user_id)
        .order_by(Flow.id)
        .all()
    )

@router.get("/published", response_model=list[FlowOut])
def list_published_flows(db: Session = Depends(get_db)):
    """
    Public : the feed's browsing list, across all users. no auth required
    since anyone can watch this containt.
    only containg published flows. 
    user drafts are visible in GET /flows
    """

    return (
        db.query(Flow)
        .filter(Flow.is_published.is_(True))
        .order_by(Flow.id)
        .all()
    )

@router.post("", response_model=FlowOut)
def create_flow(
    payload: FlowCreate, 
    db: Session = Depends(get_db),
    user_id: str = Depends(require_current_user_id)
):
    flow = Flow(name=payload.name, description=payload.description, owner_id=user_id)
    db.add(flow)
    db.commit()
    db.refresh(flow)

    return flow

@router.post("/{flow_id}/sections")
def attach_section(
    flow_id: int, 
    payload: AttachSectionRequest, 
    db: Session = Depends(get_db),
    user_id: str = Depends(require_current_user_id)
):
    flow = (
        db.query(Flow)
        .filter(Flow.id == flow_id, Flow.owner_id == user_id)
        .first()
    )
    if not flow:
        raise HTTPException(status_code=404, detail="Flow Not Found")

    # section also needs to be own by same user
    # else any other loged in user can attach clip
    # by just guessing id
    section = (
        db.query(Section)
        .filter(Section.id == payload.section_id, Section.owner_id == user_id)
        .first()
    )
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")

    if not section.clip_links:
        raise HTTPException(status_code=400, detail=f"'{section.title}' has no clips attached yet. Add at least one clip before using it in a flow")

    already_attached = (
        db.query(FlowSection)
        .filter(FlowSection.flow_id == flow_id, FlowSection.section_id == section.id)
        .first()
    )
    if already_attached:
        raise HTTPException(status_code=400, detail=f"'{section.title}' is already attached to this flow")
    
    order_index = payload.order_index
    if order_index is None:
        max_order = (
            db.query(func.max(FlowSection.order_index))
            .filter(FlowSection.flow_id == flow_id)
            .scalar()
        )
        order_index = (max_order if max_order is not None else -1) + 1

    link = FlowSection(flow_id=flow_id, section_id=section.id, order_index=order_index)
    db.add(link)
    db.commit()

    return {'attached': True, 'flow_id': flow_id, 'section_id': section.id}

@router.delete('/{flow_id}/sections/{link_id}')
def detach_section(
    flow_id: int, 
    link_id: int, 
    force: bool = False, 
    db: Session = Depends(get_db),
    user_id: str = Depends(require_current_user_id)
):
    link = db.get(FlowSection, link_id)

    if not link or link.flow_id != flow_id or link.flow.owner_id != user_id:
        raise HTTPException(status_code=404, detail='Attachment not found')

    if len(link.flow.section_links) <= 1 and not force:
        raise HTTPException(status_code=409, detail=f"'{link.section.title}' is the only section in '{link.flow.name}'. removing it will leave that flow empty and unplayable")

    db.delete(link)
    db.commit()

    return {'detached': link_id, 'flow_id': flow_id}

@router.delete('/{flow_id}')
def delete_flow(
    flow_id: int, 
    db: Session = Depends(get_db),
    user_id: str = Depends(require_current_user_id)
):
    flow = (
        db.query(Flow)
        .filter(Flow.id == flow_id, Flow.owner_id == user_id)
        .first()
    )
    if not flow:
        raise HTTPException(status_code=404, detail="Flow not found")
    
    db.delete(flow)
    db.commit()

    return {"deleted": flow_id}

@router.post('/{flow_id}/publish', response_model=FlowOut)
def publish_flow(
    flow_id: int, 
    db: Session = Depends(get_db),
    user_id: str = Depends(require_current_user_id)
):
    flow = (
        db.query(Flow)
        .filter(Flow.id == flow_id, Flow.owner_id == user_id)
        .first()
    )
    if not flow:
        raise HTTPException(status_code=404, detail="flow not found")

    # same rule playback already enforces, no publishg something that would just be broken in feed
    playability_error = get_flow_playability_error(flow)
    if playability_error:
        raise HTTPException(status_code=422, detail=playability_error)

    flow.is_published = True
    db.commit()
    db.refresh(flow)

    return flow

@router.post('/{flow_id}/unpublish', response_model=FlowOut)
def unpublish_flow(
    flow_id: int, 
    db: Session = Depends(get_db),
    user_id: str = Depends(require_current_user_id)
):
    flow = (
        db.query(Flow)
        .filter(Flow.id == flow_id, Flow.owner_id == user_id)
        .first()
    )
    if not flow:
        raise HTTPException(status_code=404, detail='flow not found')

    flow.is_published = False
    db.commit()
    db.refresh(flow)

    return flow