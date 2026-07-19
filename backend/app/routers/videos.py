from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.services.video_service import build_video_structure

router = APIRouter(prefix='/videos', tags=["videos"])

@router.get("")
def get_videos(db: Session = Depends(get_db)):
    return {
        "sections": build_video_structure(db)
    }