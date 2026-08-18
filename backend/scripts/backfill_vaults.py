"""
One-time backfill: gives every existing owner a default private Vault and
points all of their existing clips/sections at it. Mirrors the shape of
backfill_owner.py -- run this once locally, then again against CockroachDB,
after the vault_id migration and before vault_id is ever enforced NOT NULL.

Safe to re-run: skips owners who already have a default private vault, and
only touches clips/sections where vault_id is still NULL.

Usage:
    python -m scripts.backfill_vaults
"""
from app.config.database import SessionLocal
from app.models.video_clips import Clip, Section
from app.models.vaults import Vault, VaultType, VaultVisibility

DEFAULT_VAULT_NAME = "Personal Vault"

def get_or_create_default_vault(db, owner_id: str) -> Vault:
    vault = (
        db.query(Vault)
        .filter(
            Vault.owner_id == owner_id,
            Vault.type == VaultType.private,
            Vault.group_id.is_(None)
        )
        .first()
    )
    if vault:
        return vault

    vault = Vault(
        name=DEFAULT_VAULT_NAME,
        owner_id=owner_id,
        type=VaultType.private,
        group_id=None,
        view_visibility=VaultVisibility.members_only
    )
    db.add(vault)
    db.flush()   # get vault.id without a full commit yet
    return vault

def backfill() -> None:
    db = SessionLocal()
    try:
        clip_owners = {
            row[0] for row in
            db.query(Clip.owner_id).filter(Clip.owner_id.isnot(None)).distinct()
        }
        section_owners = {
            row[0] for row in
            db.query(Section.owner_id).filter(Section.owner_id.isnot(None)).distinct()
        }
        all_owners = clip_owners | section_owners

        skipped_clips = db.query(Clip).filter(Clip.owner_id.is_(None)).count()
        skipped_sections = db.query(Section).filter(Section.owner_id.is_(None)).count()

        total_clips = 0
        total_sections = 0

        for owner_id in all_owners:
            vault = get_or_create_default_vault(db, owner_id)

            clip_count = (
                db.query(Clip)
                .filter(Clip.owner_id == owner_id, Clip.vault_id.is_(None))
                .update({"vault_id": vault.id})
            )
            section_count = (
                db.query(Section)
                .filter(Section.owner_id == owner_id, Section.vault_id.is_(None))
                .update({"vault_id": vault.id})
            )

            total_clips += clip_count
            total_sections += section_count

        db.commit()

        print(f"Backfilled {len(all_owners)} owner(s):")
        print(f"  {total_clips} clip(s) assigned a vault")
        print(f"  {total_sections} section(s) assigned a vault")
        if skipped_clips or skipped_sections:
            print(
                f"Skipped {skipped_clips} clip(s) and {skipped_sections} section(s) "
                f"with no owner_id -- these need backfill_owner.py run first."
            )
    finally:
        db.close()

if __name__ == "__main__":
    backfill()