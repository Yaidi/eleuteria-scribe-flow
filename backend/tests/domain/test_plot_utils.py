import pytest
from unittest.mock import AsyncMock
from fastapi import HTTPException

from backend.app.domain.plot_utils import (
    delete_plot_steps_by_plot_id,
    plot_with_steps_factory,
    plot_list_with_steps_factory,
)
from backend.app.schemas.sections.character_schemas import CharacterSchema
from backend.app.schemas.sections.plot_schemas import PlotSchemaWithSteps

pytestmark = pytest.mark.asyncio


class Dummy:
    """Objeto dummy para simular plot, step, character"""

    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)


async def test_delete_plot_steps_by_plot_id_calls_delete():
    repo = AsyncMock()
    steps = [Dummy(id=1), Dummy(id=2)]
    repo.get_plot_step_list.return_value = steps

    await delete_plot_steps_by_plot_id(repo, plot_id=123)

    repo.get_plot_step_list.assert_awaited_once_with(123)
    assert repo.delete_plot_step.await_count == 2
    repo.delete_plot_step.assert_any_await(steps[0])
    repo.delete_plot_step.assert_any_await(steps[1])


async def test_plot_with_steps_factory_builds_schema():
    # Arrange repos
    plot_repo = AsyncMock()
    char_repo = AsyncMock()

    steps = [
        Dummy(
            id=1, plotID=10, name="s1", goal="g1", nextStepID=None, previousStepID=None
        )
    ]
    plot = Dummy(
        id=10,
        projectID=5,
        title="My Plot",
        description="desc",
        plotStepsResume="resume",
        result="success",
        importance=3,
        characterReferencesIDs=[100],
    )
    character = Dummy(
        id=100,
        name="Alice",
        importance=1,
        characteristics="brave",
        motivation="justice",
        objetive="goal",
        conflict="conflict",
        epiphany="aha",
        resumePhrase="phrase",
        projectID=5,
    )

    plot_repo.get_plot_step_list.return_value = steps
    plot_repo.get_plot.return_value = plot
    char_repo.get_character.return_value = character

    # Act
    result = await plot_with_steps_factory(plot_repo, char_repo, 10)

    # Assert
    assert isinstance(result, PlotSchemaWithSteps)
    assert result.id == 10
    assert result.title == "My Plot"
    assert len(result.plotSteps) == 1
    assert result.plotSteps[0].id == 1
    assert len(result.characters) == 1
    assert isinstance(result.characters[0], CharacterSchema)
    assert result.characters[0].name == "Alice"


async def test_plot_with_steps_factory_raises_on_missing_character():
    plot_repo = AsyncMock()
    char_repo = AsyncMock()

    plot = Dummy(
        id=10,
        projectID=5,
        title="My Plot",
        description="desc",
        plotStepsResume="resume",
        result="success",
        importance=3,
        characterReferencesIDs=[999],  # un char inexistente
    )
    plot_repo.get_plot_step_list.return_value = []
    plot_repo.get_plot.return_value = plot
    char_repo.get_character.return_value = None

    with pytest.raises(HTTPException) as exc:
        await plot_with_steps_factory(plot_repo, char_repo, 10)

    assert exc.value.status_code == 422
    assert "characters" in exc.value.detail


async def test_plot_list_with_steps_factory_returns_empty_list():
    plot_repo = AsyncMock()
    char_repo = AsyncMock()

    plot_repo.get_plots_by_project_id.return_value = []

    result = await plot_list_with_steps_factory(plot_repo, char_repo, project_id=5)

    assert result == []


async def test_plot_list_with_steps_factory_builds_list(monkeypatch):
    plot_repo = AsyncMock()
    char_repo = AsyncMock()

    plot1 = Dummy(id=1)
    plot2 = Dummy(id=2)
    plot_repo.get_plots_by_project_id.return_value = [plot1, plot2]

    fake_result = PlotSchemaWithSteps(
        id=0,
        projectID=0,
        title="t",
        description="d",
        plotStepsResume="r",
        result="res",
        importance=1,
        plotSteps=[],
        characters=[],
    )

    async def fake_factory(*args, **kwargs):
        return fake_result

    monkeypatch.setattr(
        "backend.app.domain.plot_utils.plot_with_steps_factory", fake_factory
    )

    result = await plot_list_with_steps_factory(plot_repo, char_repo, project_id=5)

    assert result == [fake_result, fake_result]
    plot_repo.get_plots_by_project_id.assert_awaited_once_with(5)
