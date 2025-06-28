from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import Query, with_polymorphic

from backend.app.data.db.db import get_session
from backend.app.data.entities.project_entities import BaseProject, ProjectList, FictionProject, NonFictionProject, \
    ThesisProject
from backend.app.data.entities.sections.world_entities import World, WorldElement
from backend.app.domain.project_utils import create_project_object_from_request, project_schema_factory, \
    update_project_object_from_request, update_project_type_on_response

from backend.app.schemas.project_schemas import BaseProjectSchema, \
    CreateProjectRequest, UpdateProjectRequest, General
from backend.app.schemas.words_stats_schemas import WordStatsUpdate

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

    projects_list_response = []
    for project in projects_list:
        projects_list_response.append(update_project_type_on_response(project))

    if len(projects_list) == 0:
        new_list = ProjectList()
        session.add(new_list)
        await session.commit()
        await session.refresh(new_list)
        return {"projects": []}
    else:
        return {"projects": projects_list_response}

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
    return project_schema_factory(new_project)

# 🔹 GET /getProject
@projects_router.get("/getProject", response_model=BaseProjectSchema)
async def get_project(
    id: int,
    session: AsyncSession = Depends(get_session)
):
    project_polymorphic = with_polymorphic(BaseProject, [FictionProject, NonFictionProject, ThesisProject])
    result = await session.execute(select(project_polymorphic).where(BaseProject.id == id))
    project = result.scalar_one_or_none()

    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    world_result = await session.execute(select(World).where(World.baseWritingProjectID == id))
    world = world_result.scalar_one_or_none()

    if world is None:
        new_world = World(baseWritingProjectID=id)
        session.add(new_world)
        await session.commit()
        await session.refresh(new_world)
        return project_schema_factory(project, new_world)

    world_elements = []
    if world:
        world_elements_result = await session.execute(
            select(WorldElement).where(WorldElement.worldID == world.id)
        )
        world_elements = world_elements_result.scalars().all()

    return project_schema_factory(project, world, world_elements)

@projects_router.post("/updateProject", response_model_exclude_none=True)
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

    return {"message": "Project info updated successfully"}

@projects_router.delete("/deleteProject/{project_id}", status_code=204)
async def delete_project(
    project_id: int,
    session: AsyncSession = Depends(get_session)
):
    result = await session.execute(select(BaseProject).where(BaseProject.id == project_id))
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    await session.delete(project)
    await session.commit()
    return

@projects_router.patch("/projects/{project_id}/word-stats")
async def update_word_stats(
    project_id: int,
    data: WordStatsUpdate,
    session: AsyncSession = Depends(get_session)
):
    result = await session.execute(select(BaseProject).where(BaseProject.id == project_id))
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if data.wordGoal is not None:
        project.word_goal = data.wordGoal
    if data.words is not None:
        project.words = data.words

    await session.commit()
    await session.refresh(project)
    return {"message": "Word stats updated successfully"}

# ─── Endpoint ───
@projects_router.patch("/projects/{project_id}/general")
async def update_general_info(
    project_id: int,
    data: General,
    session: AsyncSession = Depends(get_session)
):
    project_polymorphic = with_polymorphic(BaseProject, [FictionProject, NonFictionProject, ThesisProject])
    result = await session.execute(select(project_polymorphic).where(BaseProject.id == project_id))
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(project, field, value)

    await session.commit()
    await session.refresh(project)
    return {"message": "General info updated successfully"}
