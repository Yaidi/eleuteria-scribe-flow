from sqlalchemy import select
from typing import Sequence, Any

from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.data.entities.sections.character_entities import Character


class CharacterRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_list_by_project_id(self, project_id: int) -> Sequence[Character]:
        result = await self.session.execute(
            select(Character).where(Character.baseWritingProjectID == project_id)
        )
        return result.scalars().all()

    async def create_character(self, project_id: int) -> Character:
        character = Character(baseWritingProjectID=project_id, importance=0)
        self.session.add(character)
        await self.session.commit()
        await self.session.refresh(character)
        return character

    async def get_character(self, character_id: int) -> Character:
        result = await self.session.execute(
            select(Character).where(Character.id == character_id)
        )
        return result.scalar_one_or_none()

    async def update_character(self, character_to_update: Character):
        await self.session.commit()
        await self.session.refresh(character_to_update)

    async def delete_character(self, character):
        await self.session.delete(character)
        await self.session.commit()
