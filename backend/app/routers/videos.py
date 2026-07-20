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
    return {
        "sections": build_video_structure(db, flow.id)
    }