from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from backend.app.data.db.db import get_session
from backend.app.data.entities.sections.world_entities import World, WorldElement
from backend.app.data.respositories.sections.world_repository import WorldRepository
from backend.app.schemas.sections.world_schemas import (
    WorldSchema,
    WorldCreate,
    WorldElementSchema,
    WorldElementCreate,
    WorldWithElementsSchema,
    WorldElementDetailedSchema,
    WorldElementUpdateSchema,
)

world_router = APIRouter(prefix="/world", tags=["World"])


@world_router.post("/", response_model=WorldSchema)
async def create_world(data: WorldCreate, session: AsyncSession = Depends(get_session)):
    repository = WorldRepository(session)
    existent_world = await repository.get_world_by_project_id(data.projectID)
    if existent_world:
        raise HTTPException(
            status_code=409, detail="World already exists for this project"
        )
    new_world = await repository.create_world(data.projectID)
    return new_world


@world_router.get("/{world_id}", response_model=WorldWithElementsSchema)
async def get_world(world_id: int, session: AsyncSession = Depends(get_session)):
    repository = WorldRepository(session)
    world = await repository.get_world(world_id)
    if not world:
        raise HTTPException(status_code=404, detail="World not found")

    world_elements = await repository.get_world_elements(world_id=world_id)

    world_elements_schema = []

    if world_elements:
        for element in world_elements:
            world_elements_schema.append(
                WorldElementDetailedSchema(
                    id=element.id,
                    name=element.name,
                    description=element.description,
                    origin=element.origin,
                    conflictCause=element.conflictCause,
                    worldElementID=element.worldElementID,
                    worldID=element.worldID,
                )
            )

    complete_world = WorldWithElementsSchema(
        id=world_id,
        world_elements=world_elements_schema,
    )
    return complete_world


@world_router.get("/from_project/{project_id}", response_model=WorldWithElementsSchema)
async def get_world_by_project_id(
    project_id: int, session: AsyncSession = Depends(get_session)
):
    repository = WorldRepository(session)
    world = await repository.get_world_by_project_id(project_id)
    if not world:
        raise HTTPException(status_code=404, detail="World not found")

    world_elements = await repository.get_world_elements(world_id=world.id)

    world_elements_schema = []

    if world_elements:
        for element in world_elements:
            world_elements_schema.append(
                WorldElementDetailedSchema(
                    id=element.id,
                    name=element.name,
                    description=element.description,
                    origin=element.origin,
                    conflictCause=element.conflictCause,
                    worldElementID=element.worldElementID,
                    worldID=element.worldID,
                )
            )

    complete_world = WorldWithElementsSchema(
        id=world.id,
        world_elements=world_elements_schema,
    )
    return complete_world


@world_router.delete("/{world_id}", status_code=204)
async def delete_world(world_id: int, session: AsyncSession = Depends(get_session)):
    repository = WorldRepository(session)
    world = await repository.get_world(world_id)
    if not world:
        raise HTTPException(status_code=404, detail="World not found")
    await repository.delete_world(world)


@world_router.put("/{world_id}", response_model=WorldSchema)
async def update_world(
    world_id: int, data: WorldCreate, session: AsyncSession = Depends(get_session)
):
    repository = WorldRepository(session)
    world = await repository.get_world(world_id)
    if not world:
        raise HTTPException(status_code=404, detail="World not found")
    for key, value in data.model_dump().items():
        setattr(world, key, value)
    await repository.update_world(world)
    return world


@world_router.post("/element", response_model=WorldElementSchema)
async def create_world_element(
    data: WorldElementCreate, session: AsyncSession = Depends(get_session)
):
    repository = WorldRepository(session)
    new_element = await repository.create_world_element(world_id=data.worldID)

    return new_element


@world_router.get("/element/{element_id}", response_model=WorldElementSchema)
async def get_world_element(
    element_id: int, session: AsyncSession = Depends(get_session)
):
    repository = WorldRepository(session)

    element = await repository.get_world_element(element_id)
    if not element:
        raise HTTPException(status_code=404, detail="Element not found")
    return element


@world_router.get(
    "/elements/from_world/{world_id}", response_model=List[WorldElementSchema]
)
async def get_world_elements_by_world_id(
    world_id: int, session: AsyncSession = Depends(get_session)
):
    repository = WorldRepository(session)
    elements = await repository.get_world_elements(world_id=world_id)

    if not elements:
        raise HTTPException(status_code=404, detail="Elements not found")
    return elements


@world_router.get(
    "/nested_elements/element/{element_id}", response_model=List[WorldElementSchema]
)
async def get_nested_world_elements(
    element_id: int, session: AsyncSession = Depends(get_session)
):
    repository = WorldRepository(session)

    elements = await repository.get_nested_world_elements(world_element_id=element_id)
    if not elements:
        raise HTTPException(status_code=404, detail="Elements not found")
    return elements


@world_router.delete("/element/{element_id}", status_code=204)
async def delete_world_element(
    element_id: int, session: AsyncSession = Depends(get_session)
):
    repository = WorldRepository(session)

    element = await repository.get_world_element(element_id)
    if not element:
        raise HTTPException(status_code=404, detail="Element not found")

    await repository.delete_world_element(element)


@world_router.put("/element/{element_id}", response_model=WorldElementSchema)
async def update_world_element(
    element_id: int,
    data: WorldElementUpdateSchema,
    session: AsyncSession = Depends(get_session),
):
    repository = WorldRepository(session)

    element = await repository.get_world_element(element_id=element_id)
    if not element:
        raise HTTPException(status_code=404, detail="Element not found")
    for key, value in data.model_dump(exclude_unset=False).items():
        setattr(element, key, value)
    await repository.update_world_element(element)
    return element
