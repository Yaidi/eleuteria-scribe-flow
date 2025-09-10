from pydantic import BaseModel, ConfigDict
from typing import Optional, List


class WorldCreate(BaseModel):
    projectID: int


class WorldSchema(WorldCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)


class WorldElementCreate(BaseModel):
    worldId: int


class WorldElementSchema(WorldElementCreate):
    id: int
    name: Optional[str] = None
    description: Optional[str] = None
    origin: Optional[str] = None
    conflictCause: Optional[str] = None
    parentId: Optional[int] = None
    model_config = ConfigDict(from_attributes=True)


class WorldElementUpdateSchema(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    origin: Optional[str] = None
    conflictCause: Optional[str] = None
    parentId: Optional[int] = None
    worldId: int


""" For Get Project Response """


class WorldElementDetailedSchema(BaseModel):
    id: int
    name: Optional[str]
    description: Optional[str] = ""
    origin: Optional[str] = ""
    conflictCause: Optional[str] = ""
    parentId: Optional[int] = None
    worldId: int
    model_config = ConfigDict(from_attributes=True)


class WorldWithElementsSchema(BaseModel):
    id: int
    worldElements: Optional[List[WorldElementDetailedSchema]]
    model_config = ConfigDict(from_attributes=True)
