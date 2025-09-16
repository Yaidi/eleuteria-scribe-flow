import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime

from sqlalchemy.exc import SQLAlchemyError

from backend.app.data.entities.project_entities import BaseProject
from http.client import HTTPException

from backend.app.data.respositories.project_repository import ProjectRepository


@pytest.fixture
def mock_session():
    session = AsyncMock()
    return session


@pytest.fixture
def repository(mock_session):
    return ProjectRepository(mock_session)


@pytest.mark.asyncio
async def test_get_list():
    # Mock de session
    mock_session = AsyncMock()

    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = ["project1", "project2"]

    mock_session.execute.return_value = mock_result

    repo = ProjectRepository(mock_session)
    projects = await repo.get_list()

    assert projects == ["project1", "project2"]
    mock_session.execute.assert_awaited_once()
    mock_result.scalars.return_value.all.assert_called_once()


@pytest.mark.asyncio
async def test_create_project_list(repository, mock_session):
    await repository.create_project_list()
    assert mock_session.add.called
    assert mock_session.commit.called
    assert mock_session.refresh.called


@pytest.mark.asyncio
async def test_create_project_success(repository, mock_session):
    new_project = BaseProject()
    mock_session.add.return_value = None
    mock_session.commit.return_value = None
    mock_session.refresh.return_value = None

    result = await repository.create_project(new_project)
    assert result == new_project
    mock_session.add.assert_called_once_with(new_project)
    mock_session.commit.assert_called_once()
    mock_session.refresh.assert_called_once_with(new_project)


@pytest.mark.asyncio
async def test_get_project():
    mock_session = AsyncMock()

    mock_result = MagicMock()
    mock_result.scalar_one_or_none = MagicMock(return_value="project")

    mock_session.execute.return_value = mock_result

    repo = ProjectRepository(mock_session)
    project = await repo.get_project(1)

    assert project == "project"
    mock_session.execute.assert_awaited_once()
    mock_result.scalar_one_or_none.assert_called_once()


@pytest.mark.asyncio
async def test_update_project(repository, mock_session):
    project = BaseProject()
    project.updated_at = None

    await repository.update_project(project)
    assert isinstance(project.updated_at, datetime)
    mock_session.commit.assert_called_once()
    mock_session.refresh.assert_called_once_with(project)


@pytest.mark.asyncio
async def test_delete_project(repository, mock_session):
    project = BaseProject()

    await repository.delete_project(project)
    mock_session.delete.assert_called_once_with(project)
    mock_session.commit.assert_called_once()
