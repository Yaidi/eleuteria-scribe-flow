# ─── routers/character_router.py ───
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from backend.app.data.entities.sections.character_entities import Character
from backend.app.data.respositories.sections.character_repository import (
    CharacterRepository,
)
from backend.app.schemas.sections.character_schemas import (
    CharacterSchema,
    CharacterCreate,
    CharacterUpdate,
)
from backend.app.data.db.db import get_session

character_router = APIRouter(prefix="/characters", tags=["Characters"])


# Crear personaje
@character_router.post("/", response_model=CharacterSchema)
async def create_character(
    data: CharacterCreate, session: AsyncSession = Depends(get_session)
):
    repository = CharacterRepository(session)
    character = await repository.create_character(data.baseWritingProjectID)
    return character


# Obtener por ID
@character_router.get("/{character_id}", response_model=CharacterSchema)
async def get_character(
    character_id: int, session: AsyncSession = Depends(get_session)
):
    repository = CharacterRepository(session)
    character = await repository.get_character(character_id)
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    return character


# Obtener todos los personajes por proyecto
@character_router.get(
    "/from_project/{project_id}", response_model=list[CharacterSchema]
)
async def get_characters_from_project(
    project_id: int, session: AsyncSession = Depends(get_session)
):
    repository = CharacterRepository(session)
    return await repository.get_list_by_project_id(project_id)


# Eliminar personaje
@character_router.delete("/{character_id}", status_code=204)
async def delete_character(
    character_id: int, session: AsyncSession = Depends(get_session)
):
    repository = CharacterRepository(session)
    character = await repository.get_character(character_id)
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    await repository.delete_character(character)
    return {"message": "Character deleted successfully"}


# Actualizar parcial personaje
@character_router.patch("/{character_id}", response_model=CharacterSchema)
async def update_character(
    character_id: int,
    data: CharacterUpdate,
    session: AsyncSession = Depends(get_session),
):
    repository = CharacterRepository(session)

    character = await repository.get_character(character_id)
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(character, field, value)

    await repository.update_character(character)
    return character
