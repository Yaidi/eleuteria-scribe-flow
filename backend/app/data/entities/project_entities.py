from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()


# ───── ProjectList ─────
class ProjectList(Base):
    __tablename__ = "project_lists"

    id = Column(Integer, primary_key=True, index=True)

    projects = relationship("BaseProject", back_populates="project_list")


# ───── BaseProject ─────
class BaseProject(Base):
    __tablename__ = "base_projects"

    id = Column(Integer, primary_key=True, index=True)
    projectListID = Column(Integer, ForeignKey("project_lists.id"))
    project_name = Column(String)
    word_goal = Column(Integer)
    words = Column(Integer)
    title = Column(String)
    subtitle = Column(String)
    author = Column(String)
    type = Column(String, nullable=False)  # Needed for polymorphism

    project_list = relationship("ProjectList", back_populates="projects")

    __mapper_args__ = {
        "polymorphic_identity": "base",
        "polymorphic_on": type
    }


# ───── FictionProject ─────
class FictionProject(BaseProject):
    __tablename__ = "fiction_projects"

    id = Column(Integer, ForeignKey("base_projects.id"), primary_key=True)
    series = Column(String)
    volume = Column(Integer)
    duration = Column(String)  # Indicar si es Novela o Trilogia
    genre = Column(String)
    license = Column(String)
    situation = Column(String)
    resume_phrase = Column(String)
    resume_paragraph = Column(String)
    resume_page = Column(String)

    __mapper_args__ = {
        "polymorphic_identity": "fiction"
    }


# ───── NonFictionProject ─────
class NonFictionProject(BaseProject):
    __tablename__ = "nonfiction_projects"

    id = Column(Integer, ForeignKey("base_projects.id"), primary_key=True)
    series = Column(String)
    volume = Column(Integer)
    license = Column(String)

    __mapper_args__ = {
        "polymorphic_identity": "non-fiction"
    }


# ───── Thesis ─────
class ThesisProject(BaseProject):
    __tablename__ = "thesis_projects"

    id = Column(Integer, ForeignKey("base_projects.id"), primary_key=True)
    duration = Column(String)  # Indicar si es Articulo/Research o Tesis

    __mapper_args__ = {
        "polymorphic_identity": "thesis"
    }


# ───── Poetry ─────
class PoetryProject(BaseProject):
    __tablename__ = "poetry_projects"

    id = Column(Integer, ForeignKey("base_projects.id"), primary_key=True)

    __mapper_args__ = {
        "polymorphic_identity": "poetry"
    }


templates = [
    {
        "type": "Novel",
        "sections": ["General", "Characters", "World", "Plots", "Manuscript", "Resources"],
        "description": "Perfect for long-form fiction with complex characters and world-building"
    },
    {
        "type": "Thesis",
        "sections": ["General", "Manuscript", "References", "Bibliography", "Resources"],
        "description": "Academic writing with proper citation and reference management"
    },
    {
        "type": "Poetry",
        "sections": ["General", "Manuscript", "References", "Themes"],
        "description": "Poetry collections with thematic organization"
    },
    {
        "type": "Ilustrated",
        "sections": ["Legal and Credits", "General", "Manuscript", "Illustrations", "Resources", "Final page"],
        "description": "Picture books and illustrated works with visual elements"
    }
]
