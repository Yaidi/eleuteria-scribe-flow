from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import Query

from backend.app.data.entities.project_entities import BaseProject, ProjectList
from backend.app.data.db.db import get_session
from backend.app.schemas.project_schemas import ProjectListResponse, ProjectListItem, BaseProjectResponse, \
    CreateProjectRequest

projects_router = APIRouter()

# Define el endpoint
@projects_router.get("/getProjectList")
async def get_project_list(
    id: int,
    session: AsyncSession = Depends(get_session)
):
    result = await session.execute(
        select(BaseProject).where(BaseProject.projectListID == id)
    )
    projects = result.scalars().all()
    return {"projects": [projects]}

# 🔹 POST /createProject
@projects_router.post("/addProject", response_model=BaseProjectResponse)
async def create_project(
    data: CreateProjectRequest,
    session: AsyncSession = Depends(get_session)
):
    new_project = BaseProject(
        projectListID=data.projectListID,
        projectName=data.projectName,
        title=data.title,
        subtitle=data.subtitle,
        author=data.author,
        type="base"
    )
    session.add(new_project)
    await session.commit()
    await session.refresh(new_project)
    return BaseProjectResponse.model_validate(new_project)

# 🔹 GET /getProject?id=123
@projects_router.get("/getProject", response_model=BaseProjectResponse)
async def get_project(
    id: int,
    session: AsyncSession = Depends(get_session)
):
    result = await session.execute(select(BaseProject).where(BaseProject.id == id))
    project = result.scalar_one_or_none()

    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    return BaseProjectResponse.model_validate(project)


@projects_router.post("/createProjectList")
async def create_project_list(session: AsyncSession = Depends(get_session)):
    new_list = ProjectList()
    session.add(new_list)
    await session.commit()
    await session.refresh(new_list)
    return {"id": new_list.id}
