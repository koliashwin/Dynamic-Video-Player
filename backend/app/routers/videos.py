from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.services.video_service import build_video_structure, resolve_flow, get_flow_playability_error
from app.services.auth import clerk_auth_guard, get_current_user_id

router = APIRouter(prefix='/videos', tags=["videos"])

NOT_FOUND_DETAIL = "No flows found. check the backend or created one via POST /flows"

@router.get("")
def get_videos(
    flow_id: int | None = Query(default=None, description="Which flow to server, default is first created one"),
    db: Session = Depends(get_db),
    credentials = Depends(clerk_auth_guard)
):
    flow = resolve_flow(db, flow_id)
    
    if not flow: 
        raise HTTPException(status_code=404, detail=NOT_FOUND_DETAIL)

    if not flow.is_published:
        user_id = get_current_user_id(credentials)
        if not user_id or user_id != flow.owner_id:
            # safeguard in case if random user tries to access flows via endpoint directly
            # this will produce 404 error for draft flow insted of 403
            raise HTTPException(status_code=404, detail=NOT_FOUND_DETAIL)

    playability_error = get_flow_playability_error(flow)
    if playability_error:
        raise HTTPException(status_code=422, detail=playability_error)
    
    return build_video_structure(db, flow.id)