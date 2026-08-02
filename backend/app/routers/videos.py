from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.services.video_service import build_video_structure, resolve_flow

router = APIRouter(prefix='/videos', tags=["videos"])

@router.get("")
def get_videos(
    flow_id: int | None = Query(default=None, description="Which flow to server, default is first created one"),
    db: Session = Depends(get_db)
):
    flow = resolve_flow(db, flow_id)
    
    if not flow: 
        raise HTTPException(
            status_code=404,
            detail="No flows found. check the backend or created one vid POST /flows"
        )

    if not flow.section_links:
        raise HTTPException(
            status_code=422,
            detail=f"'{flow.name}' has no sections attached yet. add at least one before playing it"
        )

    empty_sections = [
        link.section.title for link in flow.section_links if not link.section.clip_links
    ]
    if empty_sections:
        raise HTTPException(
            status_code=422,
            detail=f"'{flow.name}' has no section(s) with no clips: {', '.join(empty_sections)}. add clips or remove them form flow"
        )
    return build_video_structure(db, flow.id)