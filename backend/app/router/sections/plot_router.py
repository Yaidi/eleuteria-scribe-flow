from typing import List

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.data.db.db import get_session
from backend.app.data.respositories.sections.character_repository import (
    CharacterRepository,
)
from backend.app.data.respositories.sections.plot_repository import PlotRepository
from backend.app.domain.plot_utils import (
    plot_list_with_steps_factory,
    plot_with_steps_factory,
    delete_plot_steps_by_plot_id,
)
from backend.app.schemas.sections.plot_schemas import (
    PlotCreate,
    PlotUpdate,
    PlotStepSchema,
    PlotStepUpdate,
    PlotStepCreate,
    PlotSchemaWithSteps,
)

plot_router = APIRouter(prefix="/plot", tags=["Plot"])


@plot_router.post("/", response_model=PlotSchemaWithSteps)
async def create_plot(data: PlotCreate, session: AsyncSession = Depends(get_session)):
    repository = PlotRepository(session)
    new_plot = await repository.create_plot(data.baseWritingProjectID)
    return PlotSchemaWithSteps(
        id=new_plot.id,
        baseWritingProjectID=new_plot.baseWritingProjectID,
        title=new_plot.title,
        description=new_plot.description,
        plotStepsResume=new_plot.plotStepsResume,
        result=new_plot.result,
        importance=new_plot.importance,
        characters=[],
        plotSteps=[],
    )


@plot_router.get("/{plot_id}", response_model=PlotSchemaWithSteps)
async def get_plot(plot_id: int, session: AsyncSession = Depends(get_session)):
    repository = PlotRepository(session)
    character_repository = CharacterRepository(session)

    plot = await repository.get_plot(plot_id)
    if not plot:
        raise HTTPException(status_code=404, detail="Plot not found")

    plot_with_steps = await plot_with_steps_factory(
        repository, character_repository, plot_id
    )

    return plot_with_steps


@plot_router.get(
    "/all/from_project/{project_id}", response_model=List[PlotSchemaWithSteps]
)
async def get_plots_from_project_id(
    project_id: int, session: AsyncSession = Depends(get_session)
):
    repository = PlotRepository(session)
    character_repository = CharacterRepository(session)
    plot_list_with_steps = await plot_list_with_steps_factory(
        repository, character_repository, project_id
    )
    return plot_list_with_steps


@plot_router.patch("/{plot_id}", response_model=PlotSchemaWithSteps)
async def update_plot(
    plot_id: int, data: PlotUpdate, session: AsyncSession = Depends(get_session)
):
    repository = PlotRepository(session)
    character_repository = CharacterRepository(session)
    plot = await repository.get_plot(plot_id)
    if not plot:
        raise HTTPException(status_code=404, detail="Plot not found")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(plot, field, value)

    await repository.update_plot(plot)
    return await plot_with_steps_factory(repository, character_repository, plot_id)


@plot_router.delete("/{plot_id}", status_code=204)
async def delete_plot(plot_id: int, session: AsyncSession = Depends(get_session)):
    repository = PlotRepository(session)
    plot = await repository.get_plot(plot_id)
    if not plot:
        raise HTTPException(status_code=404, detail="Plot not found")

    await delete_plot_steps_by_plot_id(repository, plot.id)
    await repository.delete_plot(plot)


@plot_router.post("/step/", response_model=PlotStepSchema)
async def create_plot_step(
    data: PlotStepCreate, session: AsyncSession = Depends(get_session)
):
    repository = PlotRepository(session)
    plot = await repository.get_plot(data.plotID)
    if not plot:
        raise HTTPException(status_code=404, detail="Plot not found")

    new_step = await repository.create_plot_step(data.plotID)

    return new_step


@plot_router.get("/step/{step_id}", response_model=PlotStepSchema)
async def get_plot_step(step_id: int, session: AsyncSession = Depends(get_session)):
    repository = PlotRepository(session)
    step = await repository.get_plot_step(step_id)
    if not step:
        raise HTTPException(status_code=404, detail="Step not found")
    return step


@plot_router.patch("/step/{step_id}", response_model=PlotStepSchema)
async def update_plot_step(
    step_id: int, data: PlotStepUpdate, session: AsyncSession = Depends(get_session)
):
    repository = PlotRepository(session)
    step = await repository.get_plot_step(step_id)
    if not step:
        raise HTTPException(status_code=404, detail="Step not found")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(step, field, value)

    await repository.update_plot_step(step)
    return step


@plot_router.delete("/step/{step_id}", status_code=204)
async def delete_plot_step(step_id: int, session: AsyncSession = Depends(get_session)):
    repository = PlotRepository(session)
    step = await repository.get_plot_step(step_id)
    if not step:
        raise HTTPException(status_code=404, detail="Step not found")

    await repository.delete_plot_step(step)
