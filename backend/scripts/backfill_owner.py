"""
One-time backfill: assigns every existing clip/section/flow that has no
owner_id yet to a specific Clerk user. Run this once, locally and again
against the deployed database, right after the owner_id migration and
before deploying Phase 4's enforcement -- otherwise every clip/section/
flow you've already created becomes invisible to you the moment listing
starts filtering by owner.
 
Usage:
    python -m scripts.backfill_owner user_2abc123yourClerkId
"""
import sys

from app.config.database import SessionLocal
from app.models.video_clips import Clip, Section, Flow

def backfill(user_id: str) -> None:
    db = SessionLocal()
    try:
        clip_count = db.query(Clip).filter(Clip.owner_id.is_(None)).update({"owner_id": user_id})
        section_count = db.query(Section).filter(Section.owner_id.is_(None)).update({"owner_id": user_id})
        flow_count = db.query(Flow).filter(Flow.owner_id.is_(None)).update({"owner_id": user_id})

        db.commit()

        print(f"Assigned owin_id={user_id} to :")
        print(f" {clip_count} clip(s)")
        print(f" {section_count} section(s)")
        print(f" {flow_count} flow(s)")
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: py -m scripts.backfill_owner <clerk_user_id>")
        sys.exit(1)

    backfill(sys.argv[1])