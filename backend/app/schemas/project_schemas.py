from pydantic import BaseModel, ConfigDict

from typing import Optional, List

# ───── BaseProject Response ─────
class BaseProjectResponse(BaseModel):
    id: int
    projectListID: int
    projectName: str
    title: Optional[str] = None
    subtitle: Optional[str] = None
    author: Optional[str] = None
    type: str

    model_config = ConfigDict(from_attributes=True)

# ───── ProjectList Response ─────
class ProjectListItem(BaseModel):
    id: int
    projectName: str

    model_config = ConfigDict(from_attributes=True)

class ProjectListResponse(BaseModel):
    projects: List[ProjectListItem]

# Para creación de proyecto
class CreateProjectRequest(BaseModel):
    projectListID: int
    projectName: str
    title: Optional[str] = None
    subtitle: Optional[str] = None
    author: Optional[str] = None
