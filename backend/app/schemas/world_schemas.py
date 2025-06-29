from pydantic import BaseModel, ConfigDict
from typing import Optional, List


class WorldCreate(BaseModel):
    baseWritingProjectID: int


class WorldSchema(WorldCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)


class WorldElementCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    origin: Optional[str] = ""
    conflictCause: Optional[str] = ""
    worldElementID: Optional[int] = None
    worldID: int


class WorldElementSchema(WorldElementCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)


""" For Get Project Response """


class WorldElementDetailedSchema(BaseModel):
    id: int
    name: str
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
