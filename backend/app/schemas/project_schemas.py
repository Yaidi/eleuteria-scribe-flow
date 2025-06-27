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
    resume_phrase: Optional[str] = ""
    resume_paragraph: Optional[str] = ""
    resume_page: Optional[str] = ""

class Sections(BaseModel):
    word_goal: Optional[int] = 0
    words: Optional[int] = 0
    general: Optional[General]

# ───── Proyecto base ─────
class BaseProjectSchema(BaseModel):
    id: int
    projectListID: int
    project_name: Optional[str] = ""
    type: str
    sections: Optional[Sections] = None

    model_config = ConfigDict(from_attributes=True)

# ───── Tipos específicos ─────
class FictionProjectSchema(BaseProjectSchema):
    type: Literal["fiction"]

class NonFictionProjectSchema(BaseProjectSchema):
    type: Literal["non-fiction"]

class ThesisProjectSchema(BaseProjectSchema):
    type: Literal["thesis"]

class PoetryProjectSchema(BaseProjectSchema):
    type: Literal["poetry"]

class BaseProjectItemSchema(BaseProjectSchema):
    type: Literal["base"]

# Union with discrimination
ProjectItemUnionSchema = Union[
    FictionProjectSchema,
    NonFictionProjectSchema,
    ThesisProjectSchema,
    PoetryProjectSchema,
    BaseProjectItemSchema,
]

# ───── ProjectList Response ─────
class ProjectListResponse(BaseModel):
    projects: List[ProjectItemUnionSchema]

# Para creación de proyecto
class CreateProjectRequest(BaseModel):
    type: str
    projectListID: int

# Para hacer update de proyecto
class UpdateProjectRequest(BaseModel):
    projectListID: int
    id: int
    project_name: Optional[str] = ""
    sections: Optional[Sections]
