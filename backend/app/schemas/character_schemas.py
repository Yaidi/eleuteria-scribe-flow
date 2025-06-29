from pydantic import BaseModel, ConfigDict
from typing import Optional

class CharacterBase(BaseModel):
    name: str
    importance: int
    motivation: Optional[str] = None
    objetive: Optional[str] = None
    conflict: Optional[str] = None
    epiphany: Optional[str] = None
    resume_frase: Optional[str] = None
    resume_paragraph: Optional[str] = None
    resume: Optional[str] = None
    notes: Optional[str] = None
    details: Optional[str] = None
    baseWritingProjectID: int
    plotID: Optional[int] = None

class CharacterCreate(CharacterBase):
    pass

class CharacterUpdate(BaseModel):
    name: Optional[str] = None
    importance: Optional[int] = None
    motivation: Optional[str] = None
    objetive: Optional[str] = None
    conflict: Optional[str] = None
    epiphany: Optional[str] = None
    resume_frase: Optional[str] = None
    resume_paragraph: Optional[str] = None
    resume: Optional[str] = None
    notes: Optional[str] = None
    details: Optional[str] = None

class CharacterSchema(CharacterBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
