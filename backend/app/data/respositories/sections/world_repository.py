from sqlalchemy import select
from typing import Sequence, Any

from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.data.entities.sections.world_entities import World, WorldElement


class WorldRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_world_by_project_id(self, project_id: int) -> World:
        world_result = await self.session.execute(
            select(World).where(World.projectID == project_id)
        )
        return world_result.scalar_one_or_none()

    async def get_world(self, world_id: int) -> World:
        world_result = await self.session.execute(
            select(World).where(World.id == world_id)
        )
        return world_result.scalar_one_or_none()

    async def get_world_element(self, element_id: int) -> WorldElement:
        world_element_result = await self.session.execute(
            select(WorldElement).where(WorldElement.id == element_id)
        )
        return world_element_result.scalar_one_or_none()

    async def get_world_elements(self, world_id: int) -> Sequence[WorldElement]:
        world_elements_result = await self.session.execute(
            select(WorldElement).where(WorldElement.worldId == world_id)
        )
        return world_elements_result.scalars().all()

    async def get_nested_world_elements(
        self, world_element_id: int
    ) -> Sequence[WorldElement]:
        result = await self.session.execute(
            select(WorldElement).where(WorldElement.worldElementID == world_element_id)
        )
        return result.scalars().all()

    async def create_world(self, project_id: int) -> World:
        world = World()
        world.projectID = project_id
        self.session.add(world)
        await self.session.commit()
        await self.session.refresh(world)
        return world

    async def create_world_element(self, world_id: int) -> WorldElement:
        new_element = WorldElement()
        new_element.worldID = world_id
        self.session.add(new_element)
        await self.session.commit()
        await self.session.refresh(new_element)
        return new_element

    async def update_world(self, world_to_update: World):
        await self.session.commit()
        await self.session.refresh(world_to_update)

    async def update_world_element(self, world_element_to_update: WorldElement):
        await self.session.commit()
        await self.session.refresh(world_element_to_update)

    async def delete_world(self, world: World):
        await self.session.delete(world)
        await self.session.commit()

    async def delete_world_element(self, world_element: WorldElement):
        await self.session.delete(world_element)
        await self.session.commit()
