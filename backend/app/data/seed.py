import os

from app.config.database import SessionLocal, engine, Base
from app.models.video_clips import Clip, Section, SectionClip, SectionType
from app.services.media_utils import get_video_duration, ffprobe_available

SEED_DATA = [
    {
        "title": "intro",
        "type": SectionType.single,
        "clips": [{"title": "Introduction", "filename": "intro.mp4"}],
    },
    {
        "title": "projects",
        "type": SectionType.choice,
        "clips": [
            {"title": "Project-A", "filename": "example1.mp4"},
            {"title": "Project-B", "filename": "example2.mp4"},
        ],
    },
    {
        "title": "examples",
        "type": SectionType.random,
        "clips": [
            {"title": "Example-A", "filename": "example1.mp4"},
            {"title": "Example-B", "filename": "example2.mp4"},
        ],
    },
    {
        "title": "outro",
        "type": SectionType.single,
        "clips": [{"title": "Outro", "filename": "outro.mp4"}],
    },
]

VIDEOS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "videos")

def run():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    if db.query(Section).count() > 0:
        print("sections already exists, delete app.db to reseed")
        db.close()
        return
    
    if not ffprobe_available():
        print("Warning: ffprobe not found on path, seeded clips have duration of 0.0")
    
    clips_by_filename = {}

    for order_index, section_data in enumerate(SEED_DATA):
        section = Section(
            title=section_data['title'],
            type=section_data['type'],
            order_index=order_index
        )
        db.add(section)
        db.flush()

        for clip_order, clip_data in enumerate(section_data["clips"]):
            filename = clip_data["filename"]

            clip = clips_by_filename.get(filename)
            if not clip:
                filepath = os.path.join(VIDEOS_DIR, filename)
                duration = 0.0

                if ffprobe_available() and os.path.exists(filepath):
                    try:
                        duration = get_video_duration(filepath)
                    except Exception as error:
                        print(f"Could not read duration for {filename}: {error}")

                clip = Clip(title=clip_data["title"], filename=filename, duration=duration)
                db.add(clip)
                db.flush()
                clips_by_filename[filename] = clip

            db.add(SectionClip(section_id=section.id, clip_id=clip.id, order_index=clip_order))

    db.commit()
    db.close()
    print("Seed complete.")

if __name__ == "__main__":
    run()