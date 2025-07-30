from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.data.db.db import get_session

from backend.app.data.respositories.project_repository import ProjectRepository
from backend.app.data.respositories.sections.character_repository import (
    CharacterRepository,
)
from backend.app.data.respositories.sections.plot_repository import PlotRepository
from backend.app.data.respositories.sections.world_repository import WorldRepository
from backend.app.domain.plot_utils import plot_list_with_steps_factory
from backend.app.domain.project_utils import (
    create_project_object_from_request,
    project_schema_factory,
    project_on_response_list,
)

from backend.app.schemas.project_schemas import (
    BaseProjectSchema,
    CreateProjectRequest,
    General,
    ProjectStatus,
)
from backend.app.schemas.sections.words_stats_schemas import WordStatsUpdate
from backend.app.statics.load_static import load_static_content

projects_router = APIRouter()


# Define el endpoint
@projects_router.get("/getProjectList")
async def get_project_list(session: AsyncSession = Depends(get_session)):
    repository = ProjectRepository(session)

    projects_list = await repository.get_list()

    projects_list_response = []
    for project in projects_list:
        projects_list_response.append(project_on_response_list(project))

    if len(projects_list) == 0:
        await repository.create_project_list()
        return {"projects": []}
    else:
        return {"projects": projects_list_response}


# 🔹 POST /createProject
@projects_router.post("/addProject", response_model=BaseProjectSchema)
async def create_project(
    data: CreateProjectRequest, session: AsyncSession = Depends(get_session)
):
    repository = ProjectRepository(session)
    new_project = create_project_object_from_request(data)
    new_project.created_at = datetime.now()
    new_project.updated_at = datetime.now()
    new_project.status = ProjectStatus.planning
    new_project.word_goal = 1000
    new_project.words = 0

    await repository.create_project(new_project)
    return project_schema_factory(new_project)


# 🔹 GET /getProject
@projects_router.get("/getProject", response_model=BaseProjectSchema)
async def get_project(id: int, session: AsyncSession = Depends(get_session)):
    project_repository = ProjectRepository(session)
    character_repository = CharacterRepository(session)
    world_repository = WorldRepository(session)
    plot_repository = PlotRepository(session)

    project = await project_repository.get_project(id)
    character_list = await character_repository.get_list_by_project_id(id)
    plots_with_steps = await plot_list_with_steps_factory(
        plot_repository, character_repository, id
    )

    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    world = await world_repository.get_world_by_project_id(id)

    if world is None:
        new_world = await world_repository.create_world(id)
        return project_schema_factory(
            project,
            new_world,
            characters=character_list,
            plots_with_steps=plots_with_steps,
        )

    world_elements = []
    if world:
        world_elements = await world_repository.get_world_elements(world_id=world.id)

    return project_schema_factory(
        project,
        world,
        world_elements,
        characters=character_list,
        plots_with_steps=plots_with_steps,
    )


@projects_router.get("/project/templates")
async def get_project_templates():
    templates = load_static_content()

    return {"templates": templates}


@projects_router.delete("/deleteProject/{project_id}", status_code=200)
async def delete_project(project_id: int, session: AsyncSession = Depends(get_session)):
    repository = ProjectRepository(session)
    project = await repository.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    await repository.delete_project(project)
    return {"id": project_id}


@projects_router.patch("/projects/{project_id}/word-stats")
async def update_word_stats(
    project_id: int, data: WordStatsUpdate, session: AsyncSession = Depends(get_session)
):
    repository = ProjectRepository(session)
    project = await repository.get_project(project_id)

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if data.wordGoal is not None:
        project.word_goal = data.wordGoal
    if data.words is not None:
        project.words = data.words

    await repository.update_project(project)
    return {"message": "Word stats updated successfully"}


# ─── Endpoint ───
@projects_router.patch("/projects/{project_id}/general")
async def update_general_info(
    project_id: int, data: General, session: AsyncSession = Depends(get_session)
):
    repository = ProjectRepository(session)

    project = await repository.get_project(project_id)

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(project, field, value)

    project.project_name = data.title

    await repository.update_project(project)
    return {
        "message": "General info updated successfully",
        "general": data.model_dump(exclude_none=True),
    }
