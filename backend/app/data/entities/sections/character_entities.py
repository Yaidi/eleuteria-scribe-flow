from sqlalchemy import Column, Integer, String, Text, ForeignKey

from backend.app.data.entities.project_entities import Base


# ───── Character ─────
class Character(Base):
    __tablename__ = "characters"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    importance = Column(Integer)
    characteristics = Column(String)
    motivation = Column(Text)
    objetive = Column(Text)
    conflict = Column(Text)
    epiphany = Column(Text)
    resumePhrase = Column(Text)
    resumeParagraph = Column(Text)
    resume = Column(Text)
    notes = Column(Text)
    details = Column(Text)
    baseWritingProjectID = Column(
        Integer, ForeignKey("base_projects.id", ondelete="CASCADE")
    )
    plotID = Column(Integer, ForeignKey("plots.id", ondelete="SET NULL"), nullable=True)
