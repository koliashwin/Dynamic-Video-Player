from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import random

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# mount videos
app.mount("/videos", StaticFiles(directory="videos"), name="videos")

TIMELINE = [
    {
        "type": "fixed",
        "video": "intro.mp4"
    },
    {
        "type": "random",
        "options": [
            "example1.mp4",
            "example2.mp4"
        ]
    },
    {
        "type": "fixed",
        "video": "outro.mp4"
    }
]

# experimental content structure.
# video is treated as collection of sections

# each section may contain:
# - one clip
# - multiple clips

# futrue versions may include: duration, thumbnails, tags, navigation rules, permissions

VIDEO_STRUCTURE = [
    {
        'title': 'intro',
        'clips': [
            'intro.mp4'
        ]
    },
    {
        'title': 'projects',
        'clips': [
            'example1.mp4',
            'example2.mp4'
        ]
    },
    {
        'title': 'outro',
        'clips': [
            'outro.mp4'
        ]
    },
    
]


@app.get('/videos')
def get_video():
    """
    Returns content sturcture used by frontend.

    frontend resolves navigation using:
        section index
        clip index
    rather than requesting clips individually
    """
    sections = []

    for section in VIDEO_STRUCTURE:
        sections.append({
            "title": section['title'],
            "clips": [
                f"http://localhost:8000/videos/{clip}"      #convert local clip names into publicaly accessible URLs
                for clip in section['clips']
            ]
        })
    
    return {
        "sections": sections
    }

# original proof of concept endpoint

# generates : into -> random clip -> outro

# kept for reference while developing section-based navigation model
@app.get("/playlist")
def get_playlist():
    playlist = []

    for segment in TIMELINE:
        if segment['type'] == "fixed":
            playlist.append(
                f"http://localhost:8000/videos/{segment['video']}"
            )
        elif segment['type'] == "random":
            selected = random.choice(segment["options"])
            playlist.append(
                f"http://localhost:8000/videos/{selected}"
            )

    return {
        "playlist": playlist
    }

@app.get('/')
def endpoint_check():
    return "backend working"