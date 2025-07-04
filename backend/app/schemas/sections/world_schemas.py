from pydantic import BaseModel, ConfigDict
from typing import Optional, List


class WorldCreate(BaseModel):
    projectID: int


class WorldSchema(WorldCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)


class WorldElementCreate(BaseModel):
    worldID: int


class WorldElementSchema(WorldElementCreate):
    id: int
    name: Optional[str] = None
    description: Optional[str] = None
    origin: Optional[str] = None
    conflictCause: Optional[str] = None
    worldElementID: Optional[int] = None
    model_config = ConfigDict(from_attributes=True)


class WorldElementUpdateSchema(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    origin: Optional[str] = None
    conflictCause: Optional[str] = None
    worldElementID: Optional[int] = None
    worldID: int


""" For Get Project Response """


class WorldElementDetailedSchema(BaseModel):
    id: int
    name: Optional[str]
    description: Optional[str] = ""
    origin: Optional[str] = ""
    conflictCause: Optional[str] = ""
    worldElementID: Optional[int] = None
    worldID: int
    model_config = ConfigDict(from_attributes=True)


class WorldWithElementsSchema(BaseModel):
    id: int
    world_elements: Optional[List[WorldElementDetailedSchema]]
    model_config = ConfigDict(from_attributes=True)
