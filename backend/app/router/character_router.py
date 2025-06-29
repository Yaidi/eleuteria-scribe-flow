# ─── routers/character_router.py ───
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from backend.app.data.entities.sections.character_entities import Character
from backend.app.data.entities.sections.plot_entities import Plot
from backend.app.schemas.character_schemas import (
    CharacterSchema, CharacterCreate, CharacterUpdate
)
from backend.app.data.db.db import get_session

character_router = APIRouter(prefix="/characters", tags=["Characters"])

# Crear personaje
@character_router.post("/", response_model=CharacterSchema)
async def create_character(data: CharacterCreate, session: AsyncSession = Depends(get_session)):
    character = Character(baseWritingProjectID=data.baseWritingProjectID)
    session.add(character)
    await session.commit()
    await session.refresh(character)
    return character

# Obtener por ID
@character_router.get("/{character_id}", response_model=CharacterSchema)
async def get_character(character_id: int, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Character).where(Character.id == character_id))
    character = result.scalar_one_or_none()
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    return character

# Obtener todos los personajes por proyecto
@character_router.get("/from_project/{project_id}", response_model=list[CharacterSchema])
async def get_characters_from_project(project_id: int, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Character).where(Character.baseWritingProjectID == project_id))
    return result.scalars().all()

# Eliminar personaje
@character_router.delete("/{character_id}", status_code=204)
async def delete_character(character_id: int, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Character).where(Character.id == character_id))
    character = result.scalar_one_or_none()
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    await session.delete(character)
    await session.commit()
    return {"message": "Character deleted successfully"}

# Actualizar parcial personaje
@character_router.patch("/{character_id}", response_model=CharacterSchema)
async def update_character(character_id: int, data: CharacterUpdate, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Character).where(Character.id == character_id))
    character = result.scalar_one_or_none()
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(character, field, value)

    await session.commit()
    await session.refresh(character)
    return character
