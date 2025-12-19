from pydantic import BaseModel


class SaveStartRequest(BaseModel):
    project_id: int
    relative_path: str
    filename: str
    title: str = None


class DeleteManuscriptRequest(BaseModel):
    project_id: int
    path: str


class GetManuscriptContentRequest(BaseModel):
    project_id: int
    path: str
