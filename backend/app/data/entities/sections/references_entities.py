# ───── ReferenceBase ─────
from sqlalchemy import Column, Integer, String, ForeignKey, Text

from backend.app.data.entities.project_entities import Base


class ReferenceBase(Base):
    __tablename__ = "reference_base"
    id = Column(Integer, primary_key=True)
    tipo = Column(String)
    title = Column(String)
    author = Column(String)
    year = Column(Integer)
    topic = Column(Text)
    note = Column(Text)
    baseWritingProjectID = Column(Integer, ForeignKey("base_projects.id"))
    type = Column(String)

    __mapper_args__ = {
        "polymorphic_identity": "reference_base",
        "polymorphic_on": type
    }

# ───── Book ─────
class Book(ReferenceBase):
    __tablename__ = "books"
    id = Column(Integer, ForeignKey("reference_base.id"), primary_key=True)
    editorial = Column(String)
    ISBN = Column(String)

    __mapper_args__ = {
        "polymorphic_identity": "book"
    }

# ───── Article ─────
class Article(ReferenceBase):
    __tablename__ = "articles"
    id = Column(Integer, ForeignKey("reference_base.id"), primary_key=True)
    source = Column(String)
    volume = Column(Integer)
    number = Column(Integer)
    DOI = Column(String)
    resume = Column(Text)

    __mapper_args__ = {
        "polymorphic_identity": "article"
    }

# ───── WebReference ─────
class WebReference(ReferenceBase):
    __tablename__ = "web_references"
    id = Column(Integer, ForeignKey("reference_base.id"), primary_key=True)
    consult_date = Column(String)
    url = Column(String)

    __mapper_args__ = {
        "polymorphic_identity": "web_reference"
    }

# ───── Video ─────
class Video(ReferenceBase):
    __tablename__ = "videos"
    id = Column(Integer, ForeignKey("reference_base.id"), primary_key=True)
    director = Column(String)
    platform = Column(String)
    relevant_timeframe = Column(String)

    __mapper_args__ = {
        "polymorphic_identity": "video"
    }

# ───── Interview ─────
class Interview(Base):
    __tablename__ = "interviews"
    id = Column(Integer, ForeignKey("reference_base.id"), primary_key=True)
    interviewer = Column(String)
    interviewee = Column(String)
    date = Column(String)
    format = Column(String)
    fragments = Column(Text)

    __mapper_args__ = {
        "polymorphic_identity": "interview"
    }