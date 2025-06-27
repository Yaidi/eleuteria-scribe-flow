from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Literal, Union

# ───── BaseProject Response ─────
class BaseProjectSchema(BaseModel):
    id: int
    projectListID: int
    title: Optional[str] = None
    subtitle: Optional[str] = None
    author: Optional[str] = None
    type: str

    model_config = ConfigDict(from_attributes=True)

# ───── Project Types Schemas ─────
class FictionProjectSchema(BaseProjectSchema):
    type: Literal["fiction"]
    series: Optional[str]
    volume: Optional[str]
    genre: Optional[str]
    license: Optional[str]
    situation: Optional[str]
    resume_phrase: Optional[str]
    resume_paragraph: Optional[str]
    resume_page: Optional[str]

class NonFictionProjectSchema(BaseProjectSchema):
    type: Literal["nonfiction"]
    series: Optional[str]
    volume: Optional[str]
    license: Optional[str]

class TesisProjectSchema(BaseProjectSchema):
    type: Literal["tesis"]

class BaseProjectItemSchema(BaseProjectSchema):
    type: Literal["base"]

# Union with discrimination
ProjectItemUnionSchema = Union[
    FictionProjectSchema,
    NonFictionProjectSchema,
    TesisProjectSchema,
    BaseProjectItemSchema,
]

# ───── ProjectList Response ─────

class ProjectListResponse(BaseModel):
    projects: List[ProjectItemUnionSchema]

# Para creación de proyecto
class CreateProjectRequest(BaseModel):
    type: str
    projectListID: int
    title: Optional[str] = ""
    subtitle: Optional[str] = ""
    author: Optional[str] = ""
    series: Optional[str] = ""
    volume: Optional[str] = ""
    genre: Optional[str] = ""
    license: Optional[str] = ""
    situation: Optional[str] = ""
    resume_phrase: Optional[str] = ""
    resume_paragraph: Optional[str] = ""
    resume_page: Optional[str] = ""
