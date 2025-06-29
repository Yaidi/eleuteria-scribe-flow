from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from backend.app.data.db.db import get_session

from backend.app.data.entities.sections.world_entities import World, WorldElement
from backend.app.data.respositories.project_repository import ProjectRepository
from backend.app.data.respositories.sections.character_repository import (
    CharacterRepository,
)
from backend.app.data.respositories.sections.world_repository import WorldRepository
from backend.app.domain.project_utils import (
    create_project_object_from_request,
    project_schema_factory,
    update_project_type_on_response,
)

from backend.app.schemas.project_schemas import (
    BaseProjectSchema,
    CreateProjectRequest,
    UpdateProjectRequest,
    General,
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
        projects_list_response.append(update_project_type_on_response(project))

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

    await repository.create_project(new_project)
    return project_schema_factory(new_project)


# 🔹 GET /getProject
@projects_router.get("/getProject", response_model=BaseProjectSchema)
async def get_project(id: int, session: AsyncSession = Depends(get_session)):
    project_repository = ProjectRepository(session)
    character_repository = CharacterRepository(session)
    world_repository = WorldRepository(session)

    project = await project_repository.get_project(id)
    character_list = await character_repository.get_list_by_project_id(id)

    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    world = await world_repository.get_world_by_project_id(id)

    if world is None:
        new_world = await world_repository.create_world(id)
        return project_schema_factory(project, new_world, characters=character_list)

    world_elements = []
    if world:
        world_elements = await world_repository.get_world_elements(world_id=world.id)

    return project_schema_factory(
        project, world, world_elements, characters=character_list
    )


@projects_router.post("/updateProject", response_model_exclude_none=True)
async def update_project(
    data: UpdateProjectRequest, session: AsyncSession = Depends(get_session)
):
    repository = ProjectRepository(session)

    project_to_update = await repository.get_project(data.id)

    if not project_to_update:
        raise HTTPException(status_code=404, detail="Project not found")

    if project_to_update:
        project_to_update.projectListID = data.projectListID
        project_to_update.project_name = data.projectName
        await repository.update_project(project_to_update)

    return {"message": "Project info updated successfully"}


@projects_router.get("/project/templates")
async def get_project_templates():
    templates = load_static_content("backend/app/statics/project_templates.json")

    return {"templates": templates}


@projects_router.delete("/deleteProject/{project_id}", status_code=204)
async def delete_project(project_id: int, session: AsyncSession = Depends(get_session)):
    repository = ProjectRepository(session)
    project = await repository.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    await repository.delete_project(project)
    return


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

    await repository.update_project(project)
    return {"message": "General info updated successfully"}
