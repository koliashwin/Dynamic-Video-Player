import enum

from sqlalchemy import Column, Integer, String, ForeignKey, Enum
from sqlalchemy.orm import relationship

from app.config.database import Base

class VaultType(str, enum.Enum):
    public = 'public'
    shared = 'shared'
    private = 'private'


class VaultVisibility(str, enum.Enum):
    public = 'public'
    members_only = 'members_only'


class MemberRole(str, enum.Enum):
    viewer = 'viewer'
    contributor = 'contributor'


class JoinedVia(str, enum.Enum):
    open = 'open'           # shared vault: joined on their own
    invited = 'invited'     # private vault (and owner-added shared members)


class Group(Base):
    __tablename__ = 'groups'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    owner_id = Column(String, nullable=False, index=True)   # clerk user_id ref

    members = relationship(
        'GroupMember',
        back_populates='group',
        cascade='all, delete-orphan'
    )
    vaults = relationship(
        "Vault",
        back_populates='group'
    )


class GroupMember(Base):
    __tablename__ = 'group_members'

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey('groups.id'), nullable=False)
    user_id = Column(String, nullable=False, index=True)        # clerk user_id ref
    role = Column(Enum(MemberRole), nullable=False, default=MemberRole.viewer)
    Joined_via = Column(Enum(JoinedVia), nullable=False, default=JoinedVia.invited)

    group = relationship("Group", back_populates='members')


class Vault(Base):
    __tablename__ = 'vaults'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    owner_id = Column(String, nullable=False, index=True)       # clerk user_id ref
    type = Column(Enum(VaultType), nullable=False, default=VaultType.private)       # null only for public vaults shared/private always point at group
    group_id = Column(Integer, ForeignKey('groups.id'), nullable=True)
    view_visibility = Column(Enum(VaultVisibility), nullable=False, default=VaultVisibility.members_only)

    group = relationship("Group", back_populates='vaults')