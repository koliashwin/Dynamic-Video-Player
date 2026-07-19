import enum

from sqlalchemy import Column, Integer, String, Float, ForeignKey, Enum
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
    order_index = Column(Integer, nullable=False, default=0)

    clip_links = relationship(
        "SectionClip",
        back_populates='section', 
        cascade='all, delete-orphan',
        order_by='SectionClip.order_index'
    )

class SectionClip(Base):
    __tablename__ = "section_clips"

    id = Column(Integer, primary_key=True, index=True)
    section_id = Column(Integer, ForeignKey('sections.id'), nullable=False)
    clip_id = Column(Integer, ForeignKey('clips.id'), nullable=False)
    order_index = Column(Integer, nullable=False, default=0)

    section = relationship("Section", back_populates="clip_links")
    clip = relationship("Clip", back_populates='section_links')