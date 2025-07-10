import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.router.project_router import projects_router


# Mock dependencies
@pytest.fixture
def mock_session():
    return AsyncMock(spec=AsyncSession)


@pytest.fixture
def client():
    from fastapi import FastAPI

    app = FastAPI()
    app.include_router(projects_router)
    return TestClient(app)


class TestGetProjectList:
    @patch("backend.app.router.project_router.ProjectRepository")
    def test_get_project_list_with_projects(
        self, mock_repo_class, client, mock_session
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo

        mock_project = MagicMock()
        mock_project.id = 1
        mock_project.projectName = "Test Project"
        mock_repo.get_list.return_value = [mock_project]

        with patch(
            "backend.app.router.project_router.get_session", return_value=mock_session
        ):
            with patch(
                "backend.app.router.project_router.update_project_type_on_response",
                return_value=mock_project,
            ):
                # Act
                response = client.get("/getProjectList")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert "projects" in data
        assert len(data["projects"]) == 1
        mock_repo.get_list.assert_called_once()

    @patch("backend.app.router.project_router.ProjectRepository")
    def test_get_project_list_empty(self, mock_repo_class, client, mock_session):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_list.return_value = []

        with patch(
            "backend.app.router.project_router.get_session", return_value=mock_session
        ):
            # Act
            response = client.get("/getProjectList")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data == {"projects": []}
        mock_repo.create_project_list.assert_called_once()


class TestCreateProject:
    @patch("backend.app.router.project_router.ProjectRepository")
    @patch("backend.app.router.project_router.create_project_object_from_request")
    @patch("backend.app.router.project_router.project_schema_factory")
    def test_create_project_success(
        self,
        mock_schema_factory,
        mock_create_obj,
        mock_repo_class,
        client,
        mock_session,
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo

        mock_project = MagicMock()
        mock_create_obj.return_value = mock_project

        # Mock que cumple con BaseProjectSchema
        valid_project_response = {
            "id": 1,
            "projectListID": 1,
            "projectName": "New Project",
            "type": "novel",
            "sections": None,
        }
        mock_schema_factory.return_value = valid_project_response

        request_data = {"type": "novel", "projectListID": 1}

        with patch(
            "backend.app.router.project_router.get_session", return_value=mock_session
        ):
            # Act
            response = client.post("/addProject", json=request_data)

        # Assert
        assert response.status_code == 200
        response_data = response.json()
        assert response_data["id"] == 1
        assert response_data["projectName"] == "New Project"
        assert response_data["type"] == "novel"
        mock_repo.create_project.assert_called_once_with(mock_project)
        mock_create_obj.assert_called_once()
        mock_schema_factory.assert_called_once_with(mock_project)


class TestGetProject:
    @patch("backend.app.router.project_router.ProjectRepository")
    @patch("backend.app.router.project_router.CharacterRepository")
    @patch("backend.app.router.project_router.WorldRepository")
    @patch("backend.app.router.project_router.plot_list_with_steps_factory")
    @patch("backend.app.router.project_router.project_schema_factory")
    def test_get_project_success_with_world(
        self,
        mock_schema_factory,
        mock_plot_factory,
        mock_world_repo_class,
        mock_char_repo_class,
        mock_proj_repo_class,
        client,
        mock_session,
    ):
        # Arrange
        mock_proj_repo = AsyncMock()
        mock_char_repo = AsyncMock()
        mock_world_repo = AsyncMock()

        mock_proj_repo_class.return_value = mock_proj_repo
        mock_char_repo_class.return_value = mock_char_repo
        mock_world_repo_class.return_value = mock_world_repo

        mock_project = MagicMock()
        mock_world = MagicMock()
        mock_world.id = 1
        mock_characters = []
        mock_world_elements = []
        mock_plots_with_steps = []

        # Configurar correctamente los AsyncMocks
        mock_proj_repo.get_project = AsyncMock(return_value=mock_project)
        mock_char_repo.get_list_by_project_id = AsyncMock(return_value=mock_characters)
        mock_world_repo.get_world_by_project_id = AsyncMock(return_value=mock_world)
        mock_world_repo.get_world_elements = AsyncMock(return_value=mock_world_elements)
        mock_plot_factory.return_value = mock_plots_with_steps

        # Mock que cumple con BaseProjectSchema
        valid_project_response = {
            "id": 1,
            "projectListID": 1,
            "projectName": "Test Project",
            "type": "novel",
            "sections": {
                "wordGoal": 0,
                "words": 0,
                "general": None,
                "world": None,
                "characters": [],
            },
        }
        mock_schema_factory.return_value = valid_project_response

        with patch(
            "backend.app.router.project_router.get_session", return_value=mock_session
        ):
            # Act
            response = client.get("/getProject?id=1")

        # Assert
        assert response.status_code == 200
        response_data = response.json()
        assert response_data["id"] == 1
        assert response_data["projectName"] == "Test Project"
        mock_proj_repo.get_project.assert_called_once_with(1)
        mock_char_repo.get_list_by_project_id.assert_called_once_with(1)
        mock_world_repo.get_world_by_project_id.assert_called_once_with(1)
        mock_world_repo.get_world_elements.assert_called_once_with(world_id=1)

        # Verificar que se llamó sin verificar parámetros específicos
        mock_schema_factory.assert_called_once()

    @patch("backend.app.router.project_router.ProjectRepository")
    @patch("backend.app.router.project_router.CharacterRepository")
    @patch("backend.app.router.project_router.WorldRepository")
    @patch("backend.app.router.project_router.plot_list_with_steps_factory")
    def test_get_project_not_found(
        self,
        mock_plot_factory,
        mock_world_repo_class,
        mock_char_repo_class,
        mock_proj_repo_class,
        client,
        mock_session,
    ):
        # Arrange
        mock_proj_repo = AsyncMock()
        mock_char_repo = AsyncMock()
        mock_world_repo = AsyncMock()

        mock_proj_repo_class.return_value = mock_proj_repo
        mock_char_repo_class.return_value = mock_char_repo
        mock_world_repo_class.return_value = mock_world_repo

        # Configurar correctamente todos los AsyncMocks
        mock_proj_repo.get_project = AsyncMock(return_value=None)
        mock_char_repo.get_list_by_project_id = AsyncMock(return_value=[])
        mock_plot_factory.return_value = []

        with patch(
            "backend.app.router.project_router.get_session", return_value=mock_session
        ):
            # Act
            response = client.get("/getProject?id=999")

        # Assert
        assert response.status_code == 404
        assert response.json()["detail"] == "Project not found"

    @patch("backend.app.router.project_router.ProjectRepository")
    @patch("backend.app.router.project_router.CharacterRepository")
    @patch("backend.app.router.project_router.WorldRepository")
    @patch("backend.app.router.project_router.PlotRepository")
    @patch("backend.app.router.project_router.plot_list_with_steps_factory")
    @patch("backend.app.router.project_router.project_schema_factory")
    def test_get_project_creates_world_if_none(
        self,
        mock_schema_factory,
        mock_plot_factory,
        mock_plot_repo_class,
        mock_world_repo_class,
        mock_char_repo_class,
        mock_proj_repo_class,
        client,
        mock_session,
    ):
        # Arrange
        mock_proj_repo = AsyncMock()
        mock_char_repo = AsyncMock()
        mock_world_repo = AsyncMock()
        mock_plot_repo = AsyncMock()

        mock_proj_repo_class.return_value = mock_proj_repo
        mock_char_repo_class.return_value = mock_char_repo
        mock_world_repo_class.return_value = mock_world_repo
        mock_plot_repo_class.return_value = mock_plot_repo

        mock_project = MagicMock()
        mock_new_world = MagicMock()
        mock_characters = []
        mock_plots_with_steps = []

        # Configurar correctamente los AsyncMocks
        mock_proj_repo.get_project = AsyncMock(return_value=mock_project)
        mock_char_repo.get_list_by_project_id = AsyncMock(return_value=mock_characters)
        mock_world_repo.get_world_by_project_id = AsyncMock(return_value=None)
        mock_world_repo.create_world = AsyncMock(return_value=mock_new_world)
        mock_plot_factory.return_value = mock_plots_with_steps

        # Mock que cumple con BaseProjectSchema
        valid_project_response = {
            "id": 1,
            "projectListID": 1,
            "projectName": "Test Project",
            "type": "novel",
            "sections": {
                "wordGoal": 0,
                "words": 0,
                "general": None,
                "world": None,
                "characters": [],
                "plots": [],
            },
        }
        mock_schema_factory.return_value = valid_project_response

        with patch(
            "backend.app.router.project_router.get_session", return_value=mock_session
        ):
            # Act
            response = client.get("/getProject?id=1")

        # Assert
        assert response.status_code == 200
        response_data = response.json()
        assert response_data["id"] == 1
        mock_world_repo.create_world.assert_called_once_with(1)
        mock_schema_factory.assert_called_once_with(
            mock_project,
            mock_new_world,
            characters=mock_characters,
            plots_with_steps=mock_plots_with_steps,
        )


class TestUpdateProject:
    @patch("backend.app.router.project_router.ProjectRepository")
    def test_update_project_success(self, mock_repo_class, client, mock_session):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo

        mock_project = MagicMock()
        mock_project.projectListID = 1
        mock_project.project_name = "Old Name"

        # Configurar correctamente el AsyncMock
        mock_repo.get_project = AsyncMock(return_value=mock_project)
        mock_repo.update_project = AsyncMock()

        request_data = {"id": 1, "projectListID": 2, "projectName": "Updated Name"}

        with patch(
            "backend.app.router.project_router.get_session", return_value=mock_session
        ):
            # Act
            response = client.post("/updateProject", json=request_data)

        # Assert
        assert response.status_code == 200
        assert response.json()["message"] == "Project info updated successfully"
        assert mock_project.projectListID == 2
        assert mock_project.project_name == "Updated Name"
        mock_repo.update_project.assert_called_once_with(mock_project)

    @patch("backend.app.router.project_router.ProjectRepository")
    def test_update_project_not_found(self, mock_repo_class, client, mock_session):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo

        # Configurar correctamente el AsyncMock
        mock_repo.get_project = AsyncMock(return_value=None)

        request_data = {"id": 999, "projectListID": 1, "projectName": "Test"}

        with patch(
            "backend.app.router.project_router.get_session", return_value=mock_session
        ):
            # Act
            response = client.post("/updateProject", json=request_data)

        # Assert
        assert response.status_code == 404
        assert response.json()["detail"] == "Project not found"


class TestGetProjectTemplates:
    @patch("backend.app.router.project_router.load_static_content")
    def test_get_project_templates(self, mock_load_static, client):
        # Arrange
        mock_templates = [{"name": "Novel Template", "type": "novel"}]
        mock_load_static.return_value = mock_templates

        # Act
        response = client.get("/project/templates")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert "templates" in data
        assert data["templates"] == mock_templates
        mock_load_static.assert_called_once()


class TestDeleteProject:
    @patch("backend.app.router.project_router.ProjectRepository")
    def test_delete_project_success(self, mock_repo_class, client, mock_session):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo

        mock_project = MagicMock()
        # Configurar correctamente los AsyncMocks
        mock_repo.get_project = AsyncMock(return_value=mock_project)
        mock_repo.delete_project = AsyncMock()

        with patch(
            "backend.app.router.project_router.get_session", return_value=mock_session
        ):
            # Act
            response = client.delete("/deleteProject/1")

        # Assert
        assert response.status_code == 200
        mock_repo.get_project.assert_called_once_with(1)
        mock_repo.delete_project.assert_called_once_with(mock_project)

    @patch("backend.app.router.project_router.ProjectRepository")
    def test_delete_project_not_found(self, mock_repo_class, client, mock_session):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo

        # Configurar correctamente el AsyncMock
        mock_repo.get_project = AsyncMock(return_value=None)

        with patch(
            "backend.app.router.project_router.get_session", return_value=mock_session
        ):
            # Act
            response = client.delete("/deleteProject/999")

        # Assert
        assert response.status_code == 404
        assert response.json()["detail"] == "Project not found"


class TestUpdateWordStats:
    @patch("backend.app.router.project_router.ProjectRepository")
    def test_update_word_stats_success(self, mock_repo_class, client, mock_session):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo

        mock_project = MagicMock()
        mock_project.word_goal = 1000
        mock_project.words = 500

        # Configurar correctamente los AsyncMocks
        mock_repo.get_project = AsyncMock(return_value=mock_project)
        mock_repo.update_project = AsyncMock()

        request_data = {"wordGoal": 2000, "words": 750}

        with patch(
            "backend.app.router.project_router.get_session", return_value=mock_session
        ):
            # Act
            response = client.patch("/projects/1/word-stats", json=request_data)

        # Assert
        assert response.status_code == 200
        assert response.json()["message"] == "Word stats updated successfully"
        assert mock_project.word_goal == 2000
        assert mock_project.words == 750
        mock_repo.update_project.assert_called_once_with(mock_project)

    @patch("backend.app.router.project_router.ProjectRepository")
    def test_update_word_stats_partial_update(
        self, mock_repo_class, client, mock_session
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo

        mock_project = MagicMock()
        mock_project.word_goal = 1000
        mock_project.words = 500

        # Configurar correctamente los AsyncMocks
        mock_repo.get_project = AsyncMock(return_value=mock_project)
        mock_repo.update_project = AsyncMock()

        request_data = {
            "wordGoal": 2000
            # No incluimos 'words' para probar actualización parcial
        }

        with patch(
            "backend.app.router.project_router.get_session", return_value=mock_session
        ):
            # Act
            response = client.patch("/projects/1/word-stats", json=request_data)

        # Assert
        assert response.status_code == 200
        assert mock_project.word_goal == 2000
        assert mock_project.words == 500  # Should remain unchanged

    @patch("backend.app.router.project_router.ProjectRepository")
    def test_update_word_stats_project_not_found(
        self, mock_repo_class, client, mock_session
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo

        # Configurar correctamente el AsyncMock
        mock_repo.get_project = AsyncMock(return_value=None)

        request_data = {"wordGoal": 2000, "words": 750}

        with patch(
            "backend.app.router.project_router.get_session", return_value=mock_session
        ):
            # Act
            response = client.patch("/projects/999/word-stats", json=request_data)

        # Assert
        assert response.status_code == 404
        assert response.json()["detail"] == "Project not found"


class TestUpdateGeneralInfo:
    @patch("backend.app.router.project_router.ProjectRepository")
    def test_update_general_info_success(self, mock_repo_class, client, mock_session):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo

        mock_project = MagicMock()

        # Configurar correctamente los AsyncMocks
        mock_repo.get_project = AsyncMock(return_value=mock_project)
        mock_repo.update_project = AsyncMock()

        request_data = {
            "title": "New Title",
            "author": "New Author",
            "genre": "Fantasy",
        }

        with patch(
            "backend.app.router.project_router.get_session", return_value=mock_session
        ):
            # Act
            response = client.patch("/projects/1/general", json=request_data)

        # Assert
        assert response.status_code == 200
        assert response.json()["message"] == "General info updated successfully"
        assert mock_project.title == "New Title"
        assert mock_project.author == "New Author"
        assert mock_project.genre == "Fantasy"
        mock_repo.update_project.assert_called_once_with(mock_project)

    @patch("backend.app.router.project_router.ProjectRepository")
    def test_update_general_info_partial_update(
        self, mock_repo_class, client, mock_session
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo

        mock_project = MagicMock()

        # Configurar correctamente los AsyncMocks
        mock_repo.get_project = AsyncMock(return_value=mock_project)
        mock_repo.update_project = AsyncMock()

        request_data = {
            "title": "Updated Title"
            # Solo actualizamos el título
        }

        with patch(
            "backend.app.router.project_router.get_session", return_value=mock_session
        ):
            # Act
            response = client.patch("/projects/1/general", json=request_data)

        # Assert
        assert response.status_code == 200
        assert mock_project.title == "Updated Title"

    @patch("backend.app.router.project_router.ProjectRepository")
    def test_update_general_info_project_not_found(
        self, mock_repo_class, client, mock_session
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo

        # Configurar correctamente el AsyncMock
        mock_repo.get_project = AsyncMock(return_value=None)

        request_data = {"title": "New Title"}

        with patch(
            "backend.app.router.project_router.get_session", return_value=mock_session
        ):
            # Act
            response = client.patch("/projects/999/general", json=request_data)

        # Assert
        assert response.status_code == 404
        assert response.json()["detail"] == "Project not found"


# Test de integración con errores de base de datos
class TestDatabaseErrors:
    @patch("backend.app.router.project_router.ProjectRepository")
    def test_get_project_list_database_error(
        self, mock_repo_class, client, mock_session
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_list.side_effect = Exception("Database connection error")

        with patch(
            "backend.app.router.project_router.get_session", return_value=mock_session
        ):
            # Act & Assert
            with pytest.raises(Exception):
                client.get("/getProjectList")

    @patch("backend.app.router.project_router.ProjectRepository")
    def test_create_project_database_error(self, mock_repo_class, client, mock_session):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.create_project.side_effect = Exception("Database error")

        request_data = {"type": "novel", "projectListID": 1}

        with patch(
            "backend.app.router.project_router.get_session", return_value=mock_session
        ):
            with patch(
                "backend.app.router.project_router.create_project_object_from_request"
            ):
                # Act & Assert
                with pytest.raises(Exception):
                    client.post("/addProject", json=request_data)
