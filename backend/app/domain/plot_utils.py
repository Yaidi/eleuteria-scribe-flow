from fastapi import HTTPException

from backend.app.data.respositories.sections.character_repository import (
    CharacterRepository,
)
from backend.app.data.respositories.sections.plot_repository import PlotRepository
from backend.app.schemas.sections.character_schemas import CharacterSchema
from backend.app.schemas.sections.plot_schemas import (
    PlotStepSchema,
    PlotSchemaWithSteps,
)


async def delete_plot_steps_by_plot_id(repository: PlotRepository, plot_id: int):
    plot_steps_to_delete = await repository.get_plot_step_list(plot_id)
    for plot_step in plot_steps_to_delete:
        await repository.delete_plot_step(plot_step)


async def plot_with_steps_factory(
    plot_repository: PlotRepository,
    character_repository: CharacterRepository,
    plot_id: int,
) -> PlotSchemaWithSteps:
    steps_sequence = await plot_repository.get_plot_step_list(plot_id)
    plot = await plot_repository.get_plot(plot_id)

    character_list = []
    for char_id in plot.characterReferencesIDs:
        character = await character_repository.get_character(char_id)
        if not character:
            raise HTTPException(
                status_code=422,
                detail="Some of the characters referenced in this plot do not exist",
            )
        character_list.append(
            CharacterSchema(
                id=character.id,
                name=character.name,
                importance=character.importance,
                characteristics=character.characteristics,
                motivation=character.motivation,
                objetive=character.objetive,
                conflict=character.conflict,
                epiphany=character.epiphany,
                resumePhrase=character.resumePhrase,
                projectID=character.projectID,
            )
        )

    steps_list = []
    for step in steps_sequence:
        steps_list.append(
            PlotStepSchema(
                id=step.id,
                plotID=step.plotID,
                name=step.name,
                goal=step.goal,
                nextStepID=step.nextStepID,
                previousStepID=step.previousStepID,
            )
        )

    plot_with_steps_and_chars = PlotSchemaWithSteps(
        id=plot.id,
        projectID=plot.projectID,
        title=plot.title,
        description=plot.description,
        plotStepsResume=plot.plotStepsResume,
        result=plot.result,
        importance=plot.importance,
        plotSteps=steps_list,
        characters=character_list,
    )

    return plot_with_steps_and_chars


async def plot_list_with_steps_factory(
    plot_repository: PlotRepository,
    character_repository: CharacterRepository,
    project_id: int,
) -> list[PlotSchemaWithSteps]:
    plots = await plot_repository.get_plots_by_project_id(project_id)
    if len(plots) == 0:
        return []

    plots_list = []

    for plot in plots:
        plots_list.append(
            await plot_with_steps_factory(
                plot_repository, character_repository, plot.id
            )
        )

    return plots_list
