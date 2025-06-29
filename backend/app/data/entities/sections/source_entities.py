from sqlalchemy import Column, Integer, String, Text, ForeignKey

from backend.app.data.entities.project_entities import Base


# ───── Sources ─────
class Sources(Base):
    __tablename__ = "sources"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    data = Column(Text)
    baseWritingProjectID = Column(Integer, ForeignKey("base_projects.id"))
