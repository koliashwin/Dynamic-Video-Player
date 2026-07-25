import os
import shutil
import uuid

from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.video_clips import Clip
from app.schemas.video_clip import ClipOut
from app.services.media_utils import get_video_duration

router = APIRouter(prefix='/clips', tags=['clips'])

# backend/app/routers/clips.py -> up three levels -> backend/videos
VIDEOS_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "videos",
)

ALLOWED_EXTENSIONS = (".mp4", ".mov", ".webm")

@router.get("", response_model=list[ClipOut])
def list_clips(db: Session = Depends(get_db)):
    return db.query(Clip).order_by(Clip.id).all()


@router.post("/upload", response_model=ClipOut)
async def upload_clip(
    title: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if not file.filename.lower().endswith(ALLOWED_EXTENSIONS):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. use one of: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    os.makedirs(VIDEOS_DIR, exist_ok=True)

    safe_filename = f"{uuid.uuid4().hex}_{file.filename}"
    destination = os.path.join(VIDEOS_DIR, safe_filename)

    with open(destination, 'wb') as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        duration = get_video_duration(destination)
    except Exception as error:
        os.remove(destination)
        raise HTTPException(
            status_code=500,
            detail=f"Could not read video duration: {error}"
        )
    
    clip = Clip(title=title, filename=safe_filename, duration=duration)
    db.add(clip)
    db.commit()
    db.refresh(clip)

    return clip

@router.delete('/{clip_id}')
def delete_clip(clip_id: int, db: Session = Depends(get_db)):
    clip = db.get(Clip, clip_id)

    if not clip:
        raise HTTPException(status_code=404, detail="Clip not found")
    
    filepath = os.path.join(VIDEOS_DIR, clip.filename)
    if os.path.exists(filepath):
        os.remove(filepath)
    
    db.delete(clip)
    db.commit()

    return {'deleted': clip_id}