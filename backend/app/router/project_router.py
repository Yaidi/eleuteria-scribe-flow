from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import Query, with_polymorphic

from backend.app.data.db.db import get_session
from backend.app.data.entities.project_entities import BaseProject, ProjectList, FictionProject, NonFictionProject, \
 TesisProject
from backend.app.domain.project_utils import create_project_object_from_request, project_schema_factory

from backend.app.schemas.project_schemas import BaseProjectSchema, \
    CreateProjectRequest, ProjectItemUnionSchema

projects_router = APIRouter()

# Define el endpoint
@projects_router.get("/getProjectList")
async def get_project_list(
    session: AsyncSession = Depends(get_session)
):

    result = await session.execute(
        select(BaseProject).where(BaseProject.projectListID == 1)
    )
    if len(result.scalars().all()) == 0:
        new_list = ProjectList()
        session.add(new_list)
        await session.commit()
        await session.refresh(new_list)
        result_with_fresh_list = await session.execute(
            select(BaseProject).where(BaseProject.projectListID == 1)
        )
        projects = result_with_fresh_list.scalars().all()
        return {"projects": [projects]}
    else:
        result = await session.execute(
            select(BaseProject).where(BaseProject.projectListID == 1)
        )
        projects_list = result.scalars().all()
        return {"projects": [projects_list]}

# 🔹 POST /createProject
@projects_router.post("/addProject", response_model=BaseProjectSchema)
async def create_project(
    data: CreateProjectRequest,
    session: AsyncSession = Depends(get_session)
):
    new_project = create_project_object_from_request(data)

    session.add(new_project)
    await session.commit()
    await session.refresh(new_project)
    return BaseProjectSchema.model_validate(new_project)

# 🔹 GET /getProject?id=123
@projects_router.get("/getProject", response_model=ProjectItemUnionSchema)
async def get_project(
    id: int,
    session: AsyncSession = Depends(get_session)
):
    project_polymorphic = with_polymorphic(BaseProject, [FictionProject, NonFictionProject, TesisProject])
    result = await session.execute(select(project_polymorphic).where(BaseProject.id == id))
    project = result.scalar_one_or_none()

    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    return project_schema_factory(project)
