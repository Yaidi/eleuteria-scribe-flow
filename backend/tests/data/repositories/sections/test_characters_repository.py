import pytest
from unittest.mock import AsyncMock, MagicMock
from backend.app.data.respositories.sections.character_repository import CharacterRepository
from backend.app.data.entities.sections.character_entities import Character


@pytest.mark.asyncio
async def test_get_list_by_project_id():
    mock_session = AsyncMock()

    mock_scalars = MagicMock()
    mock_scalars.all.return_value = ["char1", "char2"]

    mock_result = MagicMock()
    mock_result.scalars.return_value = mock_scalars
    mock_session.execute.return_value = mock_result

    repo = CharacterRepository(mock_session)
    result = await repo.get_list_by_project_id(1)

    assert result == ["char1", "char2"]
    mock_session.execute.assert_called_once()
    mock_result.scalars.assert_called_once()
    mock_scalars.all.assert_called_once()


@pytest.mark.asyncio
async def test_create_character():
    mock_session = AsyncMock()
    repo = CharacterRepository(mock_session)

    char = await repo.create_character(1)

    assert isinstance(char, Character)
    assert char.projectID == 1
    assert char.importance == 0
    mock_session.add.assert_called_once_with(char)
    mock_session.commit.assert_called_once()
    mock_session.refresh.assert_called_once_with(char)


@pytest.mark.asyncio
async def test_get_character():
    mock_session = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = "character"
    mock_session.execute.return_value = mock_result

    repo = CharacterRepository(mock_session)
    result = await repo.get_character(1)

    assert result == "character"
    mock_session.execute.assert_called_once()
    mock_result.scalar_one_or_none.assert_called_once()


@pytest.mark.asyncio
async def test_update_character():
    mock_session = AsyncMock()
    char = Character(projectID=1)
    repo = CharacterRepository(mock_session)

    await repo.update_character(char)

    mock_session.commit.assert_called_once()
    mock_session.refresh.assert_called_once_with(char)


@pytest.mark.asyncio
async def test_delete_character():
    mock_session = AsyncMock()
    char = Character(projectID=1)
    repo = CharacterRepository(mock_session)

    await repo.delete_character(char)

    mock_session.delete.assert_called_once_with(char)
    mock_session.commit.assert_called_once()
