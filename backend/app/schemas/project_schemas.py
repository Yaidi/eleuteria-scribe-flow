from pydantic import BaseModel, ConfigDict
from typing import Optional, List

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
        "exclude_none": True  # 👈 Esto hace que `None` no se incluya en el JSON
    }


class Sections(BaseModel):
    wordGoal: Optional[int] = 0
    words: Optional[int] = 0
    general: Optional[General]
    world: Optional[WorldWithElementsSchema] = None
    characters: Optional[List[CharacterSchema]] = None
    plots: Optional[List[PlotSchemaWithSteps]] = None

    model_config = {
        "exclude_none": True  # 👈 Esto hace que `None` no se incluya en el JSON
    }


# ───── Proyecto base ─────
class BaseProjectSchema(BaseModel):
    id: int
    projectListID: int
    projectName: Optional[str] = ""
    type: str
    sections: Optional[Sections] = None

    model_config = ConfigDict(from_attributes=True)


class MinimalBaseProjectSchema(BaseModel):
    id: int
    projectListID: int
    projectName: Optional[str] = ""

    model_config = ConfigDict(from_attributes=True)


# ───── ProjectList Response ─────
class ProjectListResponse(BaseModel):
    projects: List[BaseProjectSchema]


# Para creación de proyecto
class CreateProjectRequest(BaseModel):
    type: str
    projectListID: int


# Para hacer update de proyecto
class UpdateProjectRequest(BaseModel):
    projectListID: int
    id: int
    projectName: Optional[str] = None
