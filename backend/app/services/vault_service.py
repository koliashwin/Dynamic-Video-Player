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

def get_or_create_public_vault(db: Session, owner_id: str) -> Vault:
    vault = (
        db.query(Vault)
        .filter(
            Vault.owner_id == owner_id,
            Vault.type == VaultType.public
        )
        .first()
    )
    if vault:
        return vault

    vault = Vault(
        name="Public Vault",
        owner_id=owner_id,
        type=VaultType.public,
        group_id=None,
        view_visibility=VaultVisibility.public
    )
    db.add(vault)
    db.flush()
    return vault

def user_can_access_vault(db: Session, vault: Vault, user_id: str) -> bool:

    # first check if its owner he should have access to his own vaults
    if vault.owner_id == user_id:   
        return True
    # if user is not owner but vault is public then provid access
    if vault.type == VaultType.public: 
        return True
    # if user is not owner and vault is also not public but vault visibility is public then provid access
    if vault.type == VaultType.shared and vault.view_visibility == VaultVisibility.public:
        return True

    # shared / private vaults are not accessible to all
    return False