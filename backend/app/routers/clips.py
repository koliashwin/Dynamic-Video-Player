import os
import shutil
import uuid
import tempfile
from pathlib import Path

from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.video_clips import Clip
from app.schemas.video_clip import ClipOut
from app.services.media_utils import get_video_duration, ensure_faststart
from app.services.storage import upload_file, delete_file
from app.services.auth import require_current_user_id

router = APIRouter(prefix='/clips', tags=['clips'])

ALLOWED_EXTENSIONS = (".mp4", ".mov", ".webm")
MAX_UPLOAD_SIZE_BYTES = 500 * 1024 * 1024   # 500MB upload limit/clip
UPLOAD_CHUNK_SIZE = 1 * 1024 * 1024         # 1MB read chunks

@router.get("", response_model=list[ClipOut])
def list_clips(
    db: Session = Depends(get_db),
    user_id: str = Depends(require_current_user_id)
):
    return (
        db.query(Clip)
        .filter(Clip.owner_id == user_id)
        .order_by(Clip.id)
        .all()
    )


@router.post("/upload", response_model=ClipOut)
async def upload_clip(
    title: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user_id: str = Depends(require_current_user_id)
):
    if not file.filename.lower().endswith(ALLOWED_EXTENSIONS):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. use one of: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    extension = Path(file.filename).suffix.lower()
    safe_filename = f"{uuid.uuid4().hex}{extension}"

    with tempfile.TemporaryDirectory() as tmp_dir:
        destination = os.path.join(tmp_dir, safe_filename)

        with open(destination, 'wb') as buffer:
            # shutil.copyfileobj(file.file, buffer)
            total_written = 0
            while True:
                chunk = await file.read(UPLOAD_CHUNK_SIZE)
                if not chunk:
                    break
                total_written += len(chunk)
                if total_written > MAX_UPLOAD_SIZE_BYTES:
                    raise HTTPException(
                        status_code=413,
                        detail=f"File is too large. maximum upload size is {MAX_UPLOAD_SIZE_BYTES // (1024 * 1024)}MB."
                    )
                buffer.write(chunk)

        try:
            duration = get_video_duration(destination)
        except Exception as error:
            print(f"[upload] duration read failed for {file.filename!r}: {error}")
            raise HTTPException(
                status_code=400,
                detail=f"This file doesn't appear to be a valid video. Please check the file and try again"
            )

        try:
            ensure_faststart(destination)
            upload_file(destination, safe_filename)
        except Exception as error:
            print(f"[upload] stroage/remux failed or {file.filename!r}: {error}")
            raise HTTPException(
                status_code=500,
                detail=f"Could not upload clip to storage, try again"
            )
    
    clip = Clip(title=title, filename=safe_filename, duration=duration, owner_id=user_id)
    db.add(clip)
    db.commit()
    db.refresh(clip)

    return clip

@router.delete('/{clip_id}')
def delete_clip(
    clip_id: int, 
    force: bool = False, 
    db: Session = Depends(get_db),
    user_id: str = Depends(require_current_user_id)
):
    clip = (
        db.query(Clip)
        .filter(Clip.id == clip_id, Clip.owner_id == user_id)
        .first()
    )

    if not clip:
        raise HTTPException(status_code=404, detail="Clip not found")

    unpublished = []
    if not force:
        affected_flows_by_section = {}
        for section_link in clip.section_links:
            section = section_link.section
            if len(section.clip_links) <= 1:    # last clip in section
                flow_names = [flow_link.flow.name for flow_link in section.flow_links]
                if flow_names:
                    affected_flows_by_section[section.title] = flow_names

        if affected_flows_by_section:
            parts = [
                f"'{section_title}' (used by: {', '.join(flow_names)})"
                for section_title, flow_names in affected_flows_by_section.items()
            ]
            raise HTTPException(
                status_code=409,
                detail=f"Deleting this clip will empty: {'; '.join(parts)}"
            )
    else:
        for section_link in clip.section_links:
            section = section_link.section
            if len(section.clip_links) <= 1:
                for flow_link in section.flow_links:
                    if flow_link.flow.is_published:
                        flow_link.flow.is_published = False
                        unpublished.append(flow_link.flow.name)

    delete_file(clip.filename)
    
    db.delete(clip)
    db.commit()

    return {'deleted': clip_id, 'unpublished_flows': unpublished}