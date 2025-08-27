from sqlalchemy import Column, Integer, ForeignKey, String, Text

from backend.app.data.entities.project_entities import Base


# ───── World ─────
class World(Base):
    __tablename__ = "worlds"
    id = Column(Integer, primary_key=True)
    projectID = Column(Integer, ForeignKey("base_projects.id", ondelete="CASCADE"))


# ───── WorldElement ─────
class WorldElement(Base):
    __tablename__ = "world_elements"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    description = Column(Text)
    origin = Column(Text)
    conflictCause = Column(Text)
    parentId = Column(
        Integer,
        ForeignKey("world_elements.id", ondelete="CASCADE"),
        nullable=True,
        default=None,
    )
    worldId = Column(Integer, ForeignKey("worlds.id", ondelete="CASCADE"))
