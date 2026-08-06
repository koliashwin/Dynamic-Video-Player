from sqlalchemy.orm import Session
from app.models.video_clips import Flow
from app.services.storage import get_playback_url

def resolve_flow(db: Session, flow_id: int | None):
    if flow_id is not None:
        return db.get(Flow, flow_id)
    
    return db.query(Flow).order_by(Flow.id).first()


def get_flow_playability_error(flow: Flow) -> str | None:
    if not flow.section_links:
        return f"'{flow.name}' has no sections attached yet. add at least one before playing it"

    empty_sections = [
        link.section.title for link in flow.section_links if not link.section.clip_links
    ]
    if empty_sections:
        return f"'{flow.name}' has sections(s) with no clips: {', '.join(empty_sections)}. add clips or remove them form flow"


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