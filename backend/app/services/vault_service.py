from sqlalchemy.orm import Session

from app.models.vaults import Vault, VaultType, VaultVisibility

DEFAULT_VAULT_NAME = 'Personal Vault'

def ger_or_create_default_vault(db: Session, owner_id: str) -> Vault:
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
    db.flush()
    return vault