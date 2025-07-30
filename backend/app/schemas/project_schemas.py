from pydantic import BaseModel, ConfigDict
from typing import Optional, List

from datetime import datetime
from enum import Enum
from backend.app.schemas.sections.character_schemas import CharacterSchema
from backend.app.schemas.sections.plot_schemas import PlotSchemaWithSteps
from backend.app.schemas.sections.world_schemas import WorldWithElementsSchema


class General(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    author: Optional[str] = None
    series: Optional[str] = None
    volume: Optional[int] = None
    genre: Optional[str] = None
    license: Optional[str] = None
    situation: Optional[str] = None
    resumePhrase: Optional[str] = None
    resumeParagraph: Optional[str] = None
    resumePage: Optional[str] = None

    model_config = {
        "exclude_none": False  # 👈 Esto hace que `None` no se incluya en el JSON
    }


class Sections(BaseModel):
    general: Optional[General]
    world: Optional[WorldWithElementsSchema] = None
    characters: Optional[List[CharacterSchema]] = None
    plots: Optional[List[PlotSchemaWithSteps]] = None

    model_config = {
        "exclude_none": True  # 👈 Esto hace que `None` no se incluya en el JSON
    }


class ProjectStatus(str, Enum):
    planning = "planning"
    in_progress = "in_progress"
    done = "done"


class ProjectType(str, Enum):
    novel = "novel"
    trilogy = "trilogy"
    non_fiction = "non-fiction"
    thesis = "thesis"
    research = "research"
    poetry = "poetry"
    illustrated = "illustrated"

# ───── Proyecto base ─────
class BaseProjectSchema(BaseModel):
    id: int
    projectListID: int
    projectName: Optional[str] = ""
    type: ProjectType
    wordGoal: Optional[int] = 0
    words: Optional[int] = 0
    status: ProjectStatus = ProjectStatus.planning
    description: Optional[str] = ""
    sections: Optional[Sections] = None

    model_config = ConfigDict(from_attributes=True)


class ProjectResponseList(BaseModel):
    id: int
    projectListID: int
    projectName: Optional[str] = ""
    status: ProjectStatus = ProjectStatus.planning
    description: Optional[str] = ""
    wordGoal: Optional[int] = 0
    words: Optional[int] = 0
    type: ProjectType = ProjectType.novel
    created: datetime
    updated: datetime

    model_config = ConfigDict(from_attributes=True)


# ───── ProjectList Response ─────
class ProjectListResponse(BaseModel):
    projects: List[BaseProjectSchema]


# Para creación de proyecto
class CreateProjectRequest(BaseModel):
    type: ProjectType
    projectListID: int


# Para hacer update de proyecto
class UpdateProjectRequest(BaseModel):
    projectListID: int
    id: int
    projectName: Optional[str] = None
