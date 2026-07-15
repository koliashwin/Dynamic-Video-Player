from app.data.video_structure import VIDEO_STRUCTURE

BASE_VIDEO_URL = "http://localhost:8000/videos"

def build_video_structure():
    
    sections = []

    for section in VIDEO_STRUCTURE:
        sections.append({
            'id': section['id'],
            'title': section['title'],
            'type': section['type'],
            'clips': [
                f"{BASE_VIDEO_URL}/{clip}"
                for clip in section['clips']
            ]
        })
    
    return sections