from typing import Optional, List
from pydantic import BaseModel, ConfigDict

from backend.app.schemas.sections.character_schemas import CharacterSchema


class PlotBase(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    plotStepsResume: Optional[str] = None
    result: Optional[str] = None
    importance: Optional[int] = None


class PlotCreate(PlotBase):
    baseWritingProjectID: int


class PlotUpdate(PlotBase):
    pass


class PlotSchema(PlotBase):
    id: int
    baseWritingProjectID: int
    model_config = ConfigDict(from_attributes=True)


class PlotStepBase(BaseModel):
    name: Optional[str] = None
    goal: Optional[str] = None
    nextStepID: Optional[int] = None
    previousStepID: Optional[int] = None


class PlotStepCreate(PlotStepBase):
    plotID: int


class PlotStepUpdate(PlotStepBase):
    chapterReferencesIDs: Optional[List[int]] = []
    characterReferencesIDs: Optional[List[int]] = []
    pass


class PlotStepSchema(PlotStepBase):
    id: int
    plotID: int
    model_config = ConfigDict(from_attributes=True)


class PlotSchemaWithSteps(PlotBase):
    id: int
    baseWritingProjectID: int
    plotSteps: Optional[List[PlotStepSchema]] = []
    characters: Optional[List[CharacterSchema]] = []
    model_config = ConfigDict(from_attributes=True)
