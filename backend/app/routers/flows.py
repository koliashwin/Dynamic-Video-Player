from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.video_clips import Flow, Section, FlowSection
from app.schemas.video_clip import FlowCreate, FlowOut, AttachSectionRequest

router = APIRouter(prefix='/flows', tags=['flows'])

@router.get("", response_model=list[FlowOut])
def list_flows(db: Session = Depends(get_db)):
    return db.query(Flow).order_by(Flow.id).all()

@router.post("", response_model=FlowOut)
def create_flow(payload: FlowCreate, db: Session = Depends(get_db)):
    flow = Flow(name=payload.name, description=payload.description)
    db.add(flow)
    db.commit()
    db.refresh(flow)

    return flow

@router.post("/{flow_id}/sections")
def attach_section(flow_id: int, payload: AttachSectionRequest, db: Session = Depends(get_db)):
    flow = db.get(Flow, flow_id)
    if not flow:
        raise HTTPException(status_code=404, detail="Flow Not Found")
    
    section = db.get(Section, payload.section_id)
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    order_index = payload.order_index = payload.order_index
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

@router.delete('/{flow_id}')
def delete_flow(flow_id: int, db: Session = Depends(get_db)):
    flow = db.get(Flow, flow_id)
    if not flow:
        raise HTTPException(status_code=404, detail="Flow not found")
    
    db.delete(flow)
    db.commit()

    return {"deleted": flow_id}