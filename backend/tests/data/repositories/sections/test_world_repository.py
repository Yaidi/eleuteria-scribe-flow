import pytest
from unittest.mock import AsyncMock, MagicMock

from backend.app.data.respositories.sections.world_repository import WorldRepository
from backend.app.data.entities.sections.world_entities import World, WorldElement


@pytest.fixture
def mock_session():
    return AsyncMock()


@pytest.fixture
def repository(mock_session):
    return WorldRepository(mock_session)


@pytest.mark.asyncio
async def test_get_world_by_project_id(repository, mock_session):
    mock_result = MagicMock()
    mock_result.scalar_one_or_none = MagicMock(return_value="world")
    mock_session.execute.return_value = mock_result

    result = await repository.get_world_by_project_id(1)
    assert result == "world"
    mock_session.execute.assert_called_once()


@pytest.mark.asyncio
async def test_get_world(repository, mock_session):
    mock_result = MagicMock()
    mock_result.scalar_one_or_none = MagicMock(return_value="world")
    mock_session.execute.return_value = mock_result

    result = await repository.get_world(1)
    assert result == "world"
    mock_session.execute.assert_called_once()


@pytest.mark.asyncio
async def test_get_world_element(repository, mock_session):
    mock_result = MagicMock()
    mock_result.scalar_one_or_none = MagicMock(return_value="element")
    mock_session.execute.return_value = mock_result

    result = await repository.get_world_element(1)
    assert result == "element"
    mock_session.execute.assert_called_once()


@pytest.mark.asyncio
async def test_get_world_elements(repository, mock_session):
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = ["element1", "element2"]
    mock_session.execute.return_value = mock_result

    result = await repository.get_world_elements(1)
    assert result == ["element1", "element2"]
    mock_session.execute.assert_called_once()


@pytest.mark.asyncio
async def test_get_nested_world_elements():
    # Crear mock de la sesión
    mock_session = AsyncMock()

    mock_scalars = MagicMock()
    mock_scalars.all.return_value = ["nested1", "nested2"]

    mock_result = MagicMock()
    mock_result.scalars.return_value = mock_scalars
    mock_session.execute.return_value = mock_result

    repository = WorldRepository(mock_session)

    result = await repository.get_nested_world_elements(1)

    # Aserciones
    assert result == ["nested1", "nested2"]
    mock_session.execute.assert_called_once()
    mock_result.scalars.assert_called_once()
    mock_scalars.all.assert_called_once()


@pytest.mark.asyncio
async def test_create_world(repository, mock_session):
    mock_session.add.return_value = None
    mock_session.commit.return_value = None
    mock_session.refresh.return_value = None

    result = await repository.create_world(123)
    assert isinstance(result, World)
    assert result.projectID == 123
    mock_session.add.assert_called_once_with(result)
    mock_session.commit.assert_awaited_once()
    mock_session.refresh.assert_awaited_once_with(result)


@pytest.mark.asyncio
async def test_create_world_element(repository, mock_session):
    element_instance = WorldElement()
    mock_session.add.return_value = None
    mock_session.commit.return_value = None
    mock_session.refresh.return_value = None

    result = await repository.create_world_element(123)
    assert isinstance(result, WorldElement)
    assert result.worldId == 123
    mock_session.add.assert_called_once_with(result)
    mock_session.commit.assert_awaited_once()
    mock_session.refresh.assert_awaited_once_with(result)


@pytest.mark.asyncio
async def test_update_world(repository, mock_session):
    world = World()
    await repository.update_world(world)
    mock_session.commit.assert_awaited_once()
    mock_session.refresh.assert_awaited_once_with(world)


@pytest.mark.asyncio
async def test_update_world_element(repository, mock_session):
    element = WorldElement()
    await repository.update_world_element(element)
    mock_session.commit.assert_awaited_once()
    mock_session.refresh.assert_awaited_once_with(element)


@pytest.mark.asyncio
async def test_delete_world(repository, mock_session):
    world = World()
    await repository.delete_world(world)
    mock_session.delete.assert_awaited_once_with(world)
    mock_session.commit.assert_awaited_once()


@pytest.mark.asyncio
async def test_delete_world_element(repository, mock_session):
    element = WorldElement()
    await repository.delete_world_element(element)
    mock_session.delete.assert_awaited_once_with(element)
    mock_session.commit.assert_awaited_once()
