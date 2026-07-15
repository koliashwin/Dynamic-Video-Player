from fastapi import APIRouter
from app.services.video_service import build_video_structure

router = APIRouter(prefix='/videos', tags=["videos"])

@router.get("")
def get_videos():
    return {
        "sections": build_video_structure()
    }