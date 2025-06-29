from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from backend.app.data.db.db import get_session
from backend.app.data.entities.sections.world_entities import World, WorldElement
from backend.app.schemas.world_schemas import WorldSchema, WorldCreate, WorldElementSchema, WorldElementCreate, \
    WorldWithElementsSchema, WorldElementDetailedSchema

world_router = APIRouter(prefix="/world", tags=["World"])

@world_router.post("/", response_model=WorldSchema)
async def create_world(data: WorldCreate, session: AsyncSession = Depends(get_session)):
    new_world = World(**data.model_dump())
    session.add(new_world)
    await session.commit()
    await session.refresh(new_world)
    return new_world

@world_router.get("/{world_id}", response_model=WorldWithElementsSchema)
async def get_world(world_id: int, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(World).where(World.id == world_id))
    world = result.scalar_one_or_none()
    if not world:
        raise HTTPException(status_code=404, detail="World not found")

    elements_result = await session.execute(select(WorldElement).where(WorldElement.worldID == world_id))
    world_elements = elements_result.scalars().all()

    world_elements_schema = []

    if world_elements:
        for element in world_elements:
            world_elements_schema.append(
                WorldElementDetailedSchema(
                    id = element.id,
                    name = element.name,
                    description = element.description,
                    origin = element.origin,
                    conflictCause = element.conflictCause,
                    worldElementID = element.worldElementID,
                    worldID = element.worldID,
                )
            )

    complete_world = WorldWithElementsSchema(
        id=world_id,
        world_elements=world_elements_schema,
    )
    return complete_world

@world_router.get("/from_project/{project_id}", response_model=WorldSchema)
async def get_world_by_project_id(project_id: int, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(World).where(World.baseWritingProjectID == project_id))
    world = result.scalar_one_or_none()
    if not world:
        raise HTTPException(status_code=404, detail="World not found")
    return world

@world_router.delete("/{world_id}", status_code=204)
async def delete_world(world_id: int, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(World).where(World.id == world_id))
    world = result.scalar_one_or_none()
    if not world:
        raise HTTPException(status_code=404, detail="World not found")
    await session.delete(world)
    await session.commit()

@world_router.put("/{world_id}", response_model=WorldSchema)
async def update_world(world_id: int, data: WorldCreate, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(World).where(World.id == world_id))
    world = result.scalar_one_or_none()
    if not world:
        raise HTTPException(status_code=404, detail="World not found")
    for key, value in data.dict().items():
        setattr(world, key, value)
    await session.commit()
    await session.refresh(world)
    return world

@world_router.post("/element", response_model=WorldElementSchema)
async def create_world_element(data: WorldElementCreate, session: AsyncSession = Depends(get_session)):
    new_element = WorldElement(**data.model_dump())
    session.add(new_element)
    await session.commit()
    await session.refresh(new_element)
    return new_element

@world_router.get("/element/{element_id}", response_model=WorldElementSchema)
async def get_world_element(element_id: int, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(WorldElement).where(WorldElement.id == element_id))
    element = result.scalar_one_or_none()
    if not element:
        raise HTTPException(status_code=404, detail="Element not found")
    return element

@world_router.get("/elements/from_world/{world_id}", response_model=List[WorldElementSchema])
async def get_world_elements_by_world_id(world_id: int, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(WorldElement).where(WorldElement.worldID == world_id))
    elements = result.scalars().all()
    if not elements:
        raise HTTPException(status_code=404, detail="Elements not found")
    return elements

@world_router.get("/nested_elements/element/{element_id}", response_model=List[WorldElementSchema])
async def get_nested_world_elements(element_id: int, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(WorldElement).where(WorldElement.worldElementID == element_id))
    elements = result.scalars().all()
    if not elements:
        raise HTTPException(status_code=404, detail="Elements not found")
    return elements

@world_router.delete("/element/{element_id}", status_code=204)
async def delete_world_element(element_id: int, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(WorldElement).where(WorldElement.id == element_id))
    element = result.scalar_one_or_none()
    if not element:
        raise HTTPException(status_code=404, detail="Element not found")
    await session.delete(element)
    await session.commit()

@world_router.put("/element/{element_id}", response_model=WorldElementSchema)
async def update_world_element(element_id: int, data: WorldElementCreate, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(WorldElement).where(WorldElement.id == element_id))
    element = result.scalar_one_or_none()
    if not element:
        raise HTTPException(status_code=404, detail="Element not found")
    for key, value in data.model_dump().items():
        setattr(element, key, value)
    await session.commit()
    await session.refresh(element)
    return element
