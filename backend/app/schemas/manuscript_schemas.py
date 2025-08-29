from pydantic import BaseModel

class SaveStartRequest(BaseModel):
    project_id: int
    relative_path: str
    filename: str
    title: str = None
