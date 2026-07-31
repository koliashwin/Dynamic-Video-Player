from sqlalchemy.orm import Session
from app.models.video_clips import Flow
from app.services.storage import get_playback_url

def resolve_flow(db: Session, flow_id: int | None):
    if flow_id is not None:
        return db.get(Flow, flow_id)
    
    return db.query(Flow).order_by(Flow.id).first()


def build_video_structure(db: Session, flow_id: int | None = None):
    
    flow = resolve_flow(db, flow_id)

    if not flow:
        return None
    
    result = []
    for flow_link in flow.section_links:
        section = flow_link.section

        clips = [
            {
                'id': f"clip-{link.clip.id}",
                'title': link.clip.title,
                'url': get_playback_url(link.clip.filename),
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
    
    return {
        'flow': {'id': flow.id, 'name': flow.name},
        'sections': result
    }