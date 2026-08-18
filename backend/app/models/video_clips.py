import enum

from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship

from app.config.database import Base

class SectionType(str, enum.Enum):
    single = 'single'
    choice = 'choice'
    random = 'random'

class Clip(Base):
    
    __tablename__ = 'clips'

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    filename = Column(String, nullable=False, unique=True)
    duration = Column(Float, nullable=False, default=0.0)
    owner_id = Column(String, nullable=True, index=True)    # clerk user_id refence
    vault_id = Column(Integer, ForeignKey('vaults.id'), nullable=False, index=True)

    vault = relationship("Vault")

    section_links = relationship(
        "SectionClip", 
        back_populates='clip', 
        cascade='all, delete-orphan'
    )

class Section(Base):
    __tablename__ = 'sections'
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    type = Column(Enum(SectionType), nullable=False, default=SectionType.single)
    owner_id = Column(String, nullable=True, index=True)    # clerk user_id refence
    vault_id = Column(Integer, ForeignKey('vaults.id'), nullable=False, index=True)
    
    vault = relationship("Vault")

    clip_links = relationship(
        "SectionClip",
        back_populates='section', 
        cascade='all, delete-orphan',
        order_by='SectionClip.order_index'
    )
    flow_links = relationship(
        "FlowSection",
        back_populates='section',
        cascade='all, delete-orphan'
    )

class SectionClip(Base):
    __tablename__ = "section_clips"

    id = Column(Integer, primary_key=True, index=True)
    section_id = Column(Integer, ForeignKey('sections.id'), nullable=False)
    clip_id = Column(Integer, ForeignKey('clips.id'), nullable=False)
    order_index = Column(Integer, nullable=False, default=0)

    section = relationship("Section", back_populates="clip_links")
    clip = relationship("Clip", back_populates='section_links')


class Flow(Base):
    __tablename__ = 'flows'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    is_published = Column(Boolean, nullable=False, default=False, server_default='false')
    owner_id = Column(String, nullable=True, index=True)    # clerk user_id refence

    section_links = relationship(
        "FlowSection",
        back_populates='flow',
        cascade='all, delete-orphan',
        order_by='FlowSection.order_index'
    )


class FlowSection(Base):
    __tablename__ = "flow_sections"

    id = Column(Integer, primary_key=True, index=True)
    flow_id = Column(Integer, ForeignKey('flows.id'), nullable=False)
    section_id = Column(Integer, ForeignKey('sections.id'), nullable=False)
    order_index = Column(Integer, nullable=False, default=0)

    flow = relationship("Flow", back_populates="section_links")
    section = relationship("Section", back_populates="flow_links")