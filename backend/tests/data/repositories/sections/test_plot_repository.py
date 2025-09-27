import pytest
from unittest.mock import AsyncMock, MagicMock
from backend.app.data.respositories.sections.plot_repository import PlotRepository
from backend.app.data.entities.sections.plot_entities import Plot, PlotStep


@pytest.mark.asyncio
async def test_get_plots_by_project_id():
    mock_session = AsyncMock()

    mock_scalars = MagicMock()
    mock_scalars.all.return_value = ["plot1", "plot2"]

    mock_result = MagicMock()
    mock_result.scalars.return_value = mock_scalars
    mock_session.execute.return_value = mock_result

    repo = PlotRepository(mock_session)
    result = await repo.get_plots_by_project_id(1)

    assert result == ["plot1", "plot2"]
    mock_session.execute.assert_called_once()
    mock_result.scalars.assert_called_once()
    mock_scalars.all.assert_called_once()


@pytest.mark.asyncio
async def test_get_plot():
    mock_session = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = "plot"
    mock_session.execute.return_value = mock_result

    repo = PlotRepository(mock_session)
    result = await repo.get_plot(1)

    assert result == "plot"
    mock_session.execute.assert_called_once()
    mock_result.scalar_one_or_none.assert_called_once()


@pytest.mark.asyncio
async def test_get_plot_step():
    mock_session = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = "plot_step"
    mock_session.execute.return_value = mock_result

    repo = PlotRepository(mock_session)
    result = await repo.get_plot_step(1)

    assert result == "plot_step"
    mock_session.execute.assert_called_once()
    mock_result.scalar_one_or_none.assert_called_once()


@pytest.mark.asyncio
async def test_get_plot_step_list():
    mock_session = AsyncMock()
    mock_scalars = MagicMock()
    mock_scalars.all.return_value = ["step1", "step2"]

    mock_result = MagicMock()
    mock_result.scalars.return_value = mock_scalars
    mock_session.execute.return_value = mock_result

    repo = PlotRepository(mock_session)
    result = await repo.get_plot_step_list(1)

    assert result == ["step1", "step2"]
    mock_session.execute.assert_called_once()
    mock_result.scalars.assert_called_once()
    mock_scalars.all.assert_called_once()


@pytest.mark.asyncio
async def test_create_plot():
    mock_session = AsyncMock()
    repo = PlotRepository(mock_session)

    plot = await repo.create_plot(1)

    assert isinstance(plot, Plot)
    assert plot.projectID == 1
    assert plot.importance == 0
    mock_session.add.assert_called_once_with(plot)
    mock_session.commit.assert_called_once()
    mock_session.refresh.assert_called_once_with(plot)


@pytest.mark.asyncio
async def test_create_plot_step():
    mock_session = AsyncMock()
    repo = PlotRepository(mock_session)

    step = await repo.create_plot_step(1)

    assert isinstance(step, PlotStep)
    assert step.plotID == 1
    mock_session.add.assert_called_once_with(step)
    mock_session.commit.assert_called_once()
    mock_session.refresh.assert_called_once_with(step)


@pytest.mark.asyncio
async def test_update_plot():
    mock_session = AsyncMock()
    plot = Plot(projectID=1)
    repo = PlotRepository(mock_session)

    await repo.update_plot(plot)

    mock_session.commit.assert_called_once()
    mock_session.refresh.assert_called_once_with(plot)


@pytest.mark.asyncio
async def test_update_plot_step():
    mock_session = AsyncMock()
    step = PlotStep(plotID=1)
    repo = PlotRepository(mock_session)

    await repo.update_plot_step(step)

    mock_session.commit.assert_called_once()
    mock_session.refresh.assert_called_once_with(step)


@pytest.mark.asyncio
async def test_delete_plot():
    mock_session = AsyncMock()
    plot = Plot(projectID=1)
    repo = PlotRepository(mock_session)

    await repo.delete_plot(plot)

    mock_session.delete.assert_called_once_with(plot)
    mock_session.commit.assert_called_once()


@pytest.mark.asyncio
async def test_delete_plot_step():
    mock_session = AsyncMock()
    step = PlotStep(plotID=1)
    repo = PlotRepository(mock_session)

    await repo.delete_plot_step(step)

    mock_session.delete.assert_called_once_with(step)
    mock_session.commit.assert_called_once()
