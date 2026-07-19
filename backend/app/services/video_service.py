from sqlalchemy.orm import Session
from app.models.video_clips import Section

# base url should be fetch from .env
BASE_VIDEO_URL = "http://localhost:8000/videos"

def build_video_structure(db: Session):
    
    sections = db.query(Section).order_by(Section.order_index).all()

    result = []
    for section in sections:
        clips = [
            {
                'id': f"clip-{link.clip.id}",
                'title': link.clip.title,
                'url': f"{BASE_VIDEO_URL}/{link.clip.filename}",
                'duration': link.clip.duration
            }
            for link in section.clip_links
        ]

        result.append({
            'id': f"section-{section.id}",
            'title': section.title,
            'type': section.type,
            'clips': clips
        })
    
    return result