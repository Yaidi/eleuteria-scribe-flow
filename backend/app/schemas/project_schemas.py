from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Literal, Union

class General(BaseModel):
    title: Optional[str] = ""
    subtitle: Optional[str] = ""
    author: Optional[str] = ""
    series: Optional[str] = ""
    volume: Optional[int] = 1
    genre: Optional[str] = ""
    license: Optional[str] = ""
    situation: Optional[str] = ""
    resumePhrase: Optional[str] = ""
    resumeParagraph: Optional[str] = ""
    resumePage: Optional[str] = ""

class Sections(BaseModel):
    wordGoal: Optional[int] = 0
    words: Optional[int] = 0
    general: Optional[General]

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
    projectName: Optional[str] = ""
    sections: Optional[Sections]
