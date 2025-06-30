from sqlalchemy import select
from typing import Sequence

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import with_polymorphic

from backend.app.data.entities.project_entities import (
    BaseProject,
    ProjectList,
    FictionProject,
    NonFictionProject,
    ThesisProject,
)


class ProjectRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_list(self) -> Sequence[BaseProject]:
        result = await self.session.execute(
            select(BaseProject).where(BaseProject.projectListID == 1)
        )
        return result.scalars().all()

    async def create_project_list(self):
        new_list = ProjectList()
        self.session.add(new_list)
        await self.session.commit()
        await self.session.refresh(new_list)

    async def create_project(self, new_project):
        self.session.add(new_project)
        await self.session.commit()
        await self.session.refresh(new_project)

    async def get_project(self, project_id: int):
        project_polymorphic = with_polymorphic(
            BaseProject, [FictionProject, NonFictionProject, ThesisProject]
        )
        result = await self.session.execute(
            select(project_polymorphic).where(BaseProject.id == project_id)
        )
        return result.scalar_one_or_none()

    async def update_project(self, project_to_update: BaseProject):
        await self.session.commit()
        await self.session.refresh(project_to_update)

    async def delete_project(self, project):
        await self.session.delete(project)
        await self.session.commit()
