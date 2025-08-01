from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.orm.decl_api import DeclarativeMeta
from sqlalchemy.sql import func

from backend.app.schemas.project_schemas import ProjectType

Base = declarative_base()  # type: DeclarativeMeta


# ───── ProjectList ─────
class ProjectList(Base):
    __tablename__ = "project_lists"

    id = Column(Integer, primary_key=True, index=True)

    projects = relationship(
        "BaseProject", back_populates="project_list", passive_deletes=True
    )


# ───── BaseProject ─────
class BaseProject(Base):
    __tablename__ = "base_projects"

    id = Column(Integer, primary_key=True, index=True)
    projectListID = Column(Integer, ForeignKey("project_lists.id", ondelete="CASCADE"))
    project_name = Column(String)
    word_goal = Column(Integer)
    words = Column(Integer)
    title = Column(String)
    subtitle = Column(String)
    author = Column(String)
    type = Column(String, nullable=False)  # Needed for polymorphism
    status = Column(String, nullable=False)
    description = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    project_list = relationship(
        "ProjectList", back_populates="projects", passive_deletes=True
    )

    __mapper_args__ = {"polymorphic_identity": "base", "polymorphic_on": type}


# ───── FictionProject ─────
class FictionProject(BaseProject):
    __tablename__ = "fiction_projects"

    id = Column(
        Integer, ForeignKey("base_projects.id", ondelete="CASCADE"), primary_key=True
    )
    series = Column(String)
    volume = Column(Integer)
    duration = Column(String)  # Indicar si es Novela o Trilogia
    genre = Column(String)
    license = Column(String)
    situation = Column(String)
    resume_phrase = Column(String)
    resume_paragraph = Column(String)
    resume_page = Column(String)

    __mapper_args__ = {"polymorphic_identity": ProjectType.novel}


# ───── NonFictionProject ─────
class NonFictionProject(BaseProject):
    __tablename__ = "nonfiction_projects"

    id = Column(
        Integer, ForeignKey("base_projects.id", ondelete="CASCADE"), primary_key=True
    )
    series = Column(String)
    volume = Column(Integer)
    license = Column(String)

    __mapper_args__ = {"polymorphic_identity": ProjectType.thesis}


# ───── Thesis ─────
class ThesisProject(BaseProject):
    __tablename__ = "thesis_projects"

    id = Column(
        Integer, ForeignKey("base_projects.id", ondelete="CASCADE"), primary_key=True
    )
    duration = Column(String)  # Indicar si es Articulo/Research o Tesis

    __mapper_args__ = {"polymorphic_identity": ProjectType.thesis}


# ───── Poetry ─────
class PoetryProject(BaseProject):
    __tablename__ = "poetry_projects"

    id = Column(
        Integer, ForeignKey("base_projects.id", ondelete="CASCADE"), primary_key=True
    )

    __mapper_args__ = {"polymorphic_identity": ProjectType.poetry}
