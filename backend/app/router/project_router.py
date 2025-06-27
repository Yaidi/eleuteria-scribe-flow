from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import Query, with_polymorphic

from backend.app.data.db.db import get_session
from backend.app.data.entities.project_entities import BaseProject, ProjectList, FictionProject, NonFictionProject, \
    ThesisProject
from backend.app.domain.project_utils import create_project_object_from_request, project_schema_factory, \
    update_project_object_from_request

from backend.app.schemas.project_schemas import BaseProjectSchema, \
    CreateProjectRequest, ProjectItemUnionSchema, UpdateProjectRequest

projects_router = APIRouter()

# Define el endpoint
@projects_router.get("/getProjectList")
async def get_project_list(
    session: AsyncSession = Depends(get_session)
):

    result = await session.execute(
        select(BaseProject).where(BaseProject.projectListID == 1)
    )
    projects_list = result.scalars().all()

    if len(projects_list) == 0:
        new_list = ProjectList()
        session.add(new_list)
        await session.commit()
        await session.refresh(new_list)
        return {"projects": []}
    else:
        return {"projects": projects_list}

# 🔹 POST /createProject
@projects_router.post("/addProject", response_model=ProjectItemUnionSchema)
async def create_project(
    data: CreateProjectRequest,
    session: AsyncSession = Depends(get_session)
):
    new_project = create_project_object_from_request(data)

    session.add(new_project)
    await session.commit()
    await session.refresh(new_project)
    return project_schema_factory(new_project)

# 🔹 GET /getProject
@projects_router.get("/getProject", response_model=ProjectItemUnionSchema)
async def get_project(
    id: int,
    session: AsyncSession = Depends(get_session)
):
    project_polymorphic = with_polymorphic(BaseProject, [FictionProject, NonFictionProject, ThesisProject])
    result = await session.execute(select(project_polymorphic).where(BaseProject.id == id))
    project = result.scalar_one_or_none()

    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    return project_schema_factory(project)

@projects_router.post("/updateProject", response_model=ProjectItemUnionSchema)
async def update_project(
    data: UpdateProjectRequest,
    session: AsyncSession = Depends(get_session)
):
    project_polymorphic = with_polymorphic(BaseProject, [FictionProject, NonFictionProject, ThesisProject])
    result = await session.execute(select(project_polymorphic).where(BaseProject.id == data.id))
    project_to_update = result.scalar_one_or_none()

    if not project_to_update:
        raise HTTPException(status_code=404, detail="Project not found")

    if project_to_update:
        update_project_object_from_request(data, project_to_update)
        await session.commit()
        await session.refresh(project_to_update)

    return project_schema_factory(project_to_update)