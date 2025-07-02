import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.router.sections.plot_router import plot_router


# Mock dependencies
@pytest.fixture
def mock_session():
    return AsyncMock(spec=AsyncSession)


@pytest.fixture
def client():
    from fastapi import FastAPI

    app = FastAPI()
    app.include_router(plot_router)
    return TestClient(app)


@pytest.fixture
def mock_plot():
    plot = MagicMock()
    plot.id = 1
    plot.baseWritingProjectID = 1
    plot.title = "Test Plot"
    plot.description = "Test Description"
    plot.plotStepsResume = "Test Resume"
    plot.result = "Test Result"
    plot.importance = 5
    plot.chapterReferencesIDs = []
    return plot


@pytest.fixture
def mock_plot_step():
    step = MagicMock()
    step.id = 1
    step.plotID = 1
    step.name = "Test Step"
    step.goal = "Test Goal"
    step.nextStepID = None
    step.previousStepID = None
    return step


class TestCreatePlot:
    @patch("backend.app.router.sections.plot_router.PlotRepository")
    def test_create_plot_success(
        self, mock_repo_class, client, mock_session, mock_plot
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.create_plot = AsyncMock(return_value=mock_plot)

        request_data = {"baseWritingProjectID": 1}

        with patch(
            "backend.app.router.sections.plot_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.post("/plot/", json=request_data)

        # Assert
        assert response.status_code == 200
        response_data = response.json()
        assert response_data["id"] == 1
        assert response_data["baseWritingProjectID"] == 1
        assert response_data["title"] == "Test Plot"
        mock_repo.create_plot.assert_called_once_with(1)

    @patch("backend.app.router.sections.plot_router.PlotRepository")
    def test_create_plot_database_error(self, mock_repo_class, client, mock_session):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.create_plot.side_effect = Exception("Database error")

        request_data = {"baseWritingProjectID": 1}

        with patch(
            "backend.app.router.sections.plot_router.get_session",
            return_value=mock_session,
        ):
            # Act & Assert
            with pytest.raises(Exception):
                client.post("/plot/", json=request_data)


class TestGetPlot:
    @patch("backend.app.router.sections.plot_router.plot_with_steps_factory")
    @patch("backend.app.router.sections.plot_router.PlotRepository")
    def test_get_plot_success(
        self,
        mock_repo_class,
        mock_factory,
        client,
        mock_session,
        mock_plot,
        mock_plot_step,
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_plot = AsyncMock(return_value=mock_plot)

        # Mock the factory to return a complete plot with steps
        mock_plot_with_steps = {
            "id": 1,
            "title": "Test Plot",
            "description": "Test Description",
            "plotStepsResume": "Test Resume",
            "result": "Test Result",
            "importance": 5,
            "chapterReferencesIDs": [],
            "baseWritingProjectID": 1,
            "plotSteps": [
                {
                    "id": 1,
                    "name": "Test Step",
                    "description": "Step Description",
                    "plotID": 1,
                }
            ],
        }
        mock_factory.return_value = mock_plot_with_steps

        with patch(
            "backend.app.router.sections.plot_router.get_session",
            return_value=mock_session,
        ), patch("backend.app.router.sections.plot_router.CharacterRepository"):
            # Act
            response = client.get("/plot/1")

        # Assert
        assert response.status_code == 200
        response_data = response.json()
        assert response_data["id"] == 1
        assert response_data["title"] == "Test Plot"
        assert "plotSteps" in response_data
        assert len(response_data["plotSteps"]) == 1
        assert response_data["plotSteps"][0]["id"] == 1
        assert response_data["plotSteps"][0]["name"] == "Test Step"
        mock_repo.get_plot.assert_called_once_with(1)
        mock_factory.assert_called_once()

    @patch("backend.app.router.sections.plot_router.PlotRepository")
    def test_get_plot_not_found(self, mock_repo_class, client, mock_session):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_plot = AsyncMock(return_value=None)

        with patch(
            "backend.app.router.sections.plot_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.get("/plot/999")

        # Assert
        assert response.status_code == 404
        assert response.json()["detail"] == "Plot not found"
        mock_repo.get_plot.assert_called_once_with(999)

    @patch("backend.app.router.sections.plot_router.PlotRepository")
    def test_get_plot_with_empty_steps(
        self, mock_repo_class, client, mock_session, mock_plot
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_plot = AsyncMock(return_value=mock_plot)
        mock_repo.get_plot_step_list = AsyncMock(return_value=[])

        with patch(
            "backend.app.router.sections.plot_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.get("/plot/1")

        # Assert
        assert response.status_code == 200
        response_data = response.json()
        assert response_data["id"] == 1
        assert response_data["plotSteps"] == []


class TestGetPlotsFromProject:
    @patch("backend.app.router.sections.plot_router.plot_list_with_steps_factory")
    @patch("backend.app.router.sections.plot_router.PlotRepository")
    def test_get_plots_from_project_success(
        self, mock_repo_class, mock_factory, client, mock_session
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo

        mock_plot_with_steps = {
            "id": 1,
            "baseWritingProjectID": 1,
            "title": "Test Plot",
            "description": "Test Description",
            "plotStepsResume": "Test Resume",
            "result": "Test Result",
            "importance": 5,
            "plotSteps": [],
        }
        mock_factory.return_value = [mock_plot_with_steps]

        with patch(
            "backend.app.router.sections.plot_router.get_session",
            return_value=mock_session,
        ), patch(
            "backend.app.router.sections.plot_router.CharacterRepository"
        ) as mock_char_repo_class:
            mock_char_repo = AsyncMock()
            mock_char_repo_class.return_value = mock_char_repo

            # Act
            response = client.get("/plot/all/from_project/1")

        # Assert
        assert response.status_code == 200
        response_data = response.json()
        assert len(response_data) == 1
        assert response_data[0]["id"] == 1
        assert response_data[0]["title"] == "Test Plot"
        # Corregir la assertion para incluir CharacterRepository
        mock_factory.assert_called_once_with(mock_repo, mock_char_repo, 1)

    @patch("backend.app.router.sections.plot_router.plot_list_with_steps_factory")
    @patch("backend.app.router.sections.plot_router.PlotRepository")
    def test_get_plots_from_project_empty(
        self, mock_repo_class, mock_factory, client, mock_session
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_factory.return_value = []

        with patch(
            "backend.app.router.sections.plot_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.get("/plot/all/from_project/1")

        # Assert
        assert response.status_code == 200
        response_data = response.json()
        assert response_data == []


class TestUpdatePlot:

    @patch("backend.app.router.sections.plot_router.plot_with_steps_factory")
    @patch("backend.app.router.sections.plot_router.PlotRepository")
    @patch("backend.app.router.sections.plot_router.CharacterRepository")
    def test_update_plot_success(
        self,
        mock_char_repo_class,
        mock_repo_class,
        mock_factory,
        client,
        mock_session,
        mock_plot,
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_char_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_char_repo_class.return_value = mock_char_repo

        mock_repo.get_plot = AsyncMock(return_value=mock_plot)
        mock_repo.update_plot = AsyncMock()

        # Mock the factory to return a complete plot with steps
        mock_plot_with_steps = {
            "id": 1,
            "title": "Updated Plot",
            "description": "Updated Description",
            "plotStepsResume": "Updated Resume",
            "result": "Updated Result",
            "importance": 8,
            "chapterReferencesIDs": [],
            "baseWritingProjectID": 1,
            "plotSteps": [],
        }
        mock_factory.return_value = mock_plot_with_steps

        request_data = {
            "title": "Updated Plot",
            "description": "Updated Description",
            "importance": 8,
        }

        with patch(
            "backend.app.router.sections.plot_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.patch("/plot/1", json=request_data)

        # Assert
        assert response.status_code == 200
        response_data = response.json()
        assert response_data["id"] == 1
        assert response_data["title"] == "Updated Plot"

        # Verificar que get_plot se llamó solo una vez
        mock_repo.get_plot.assert_called_once_with(1)
        mock_repo.update_plot.assert_called_once_with(mock_plot)
        mock_factory.assert_called_once()

    @patch("backend.app.router.sections.plot_router.PlotRepository")
    def test_update_plot_partial_update(
        self, mock_repo_class, client, mock_session, mock_plot
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_plot = AsyncMock(return_value=mock_plot)
        mock_repo.update_plot = AsyncMock()

        original_description = mock_plot.description
        request_data = {"title": "Only Title Updated"}

        with patch(
            "backend.app.router.sections.plot_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.patch("/plot/1", json=request_data)

        # Assert
        assert response.status_code == 200
        assert mock_plot.title == "Only Title Updated"
        assert mock_plot.description == original_description  # Should remain unchanged

    @patch("backend.app.router.sections.plot_router.PlotRepository")
    def test_update_plot_not_found(self, mock_repo_class, client, mock_session):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_plot = AsyncMock(return_value=None)

        request_data = {"title": "Updated Title"}

        with patch(
            "backend.app.router.sections.plot_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.patch("/plot/999", json=request_data)

        # Assert
        assert response.status_code == 404
        assert response.json()["detail"] == "Plot not found"


class TestDeletePlot:
    @patch("backend.app.router.sections.plot_router.PlotRepository")
    def test_delete_plot_success(
        self, mock_repo_class, client, mock_session, mock_plot
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_plot = AsyncMock(return_value=mock_plot)
        mock_repo.delete_plot = AsyncMock()

        with patch(
            "backend.app.router.sections.plot_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.delete("/plot/1")

        # Assert
        assert response.status_code == 204
        mock_repo.get_plot.assert_called_once_with(1)
        mock_repo.delete_plot.assert_called_once_with(mock_plot)

    @patch("backend.app.router.sections.plot_router.PlotRepository")
    def test_delete_plot_not_found(self, mock_repo_class, client, mock_session):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_plot = AsyncMock(return_value=None)

        with patch(
            "backend.app.router.sections.plot_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.delete("/plot/999")

        # Assert
        assert response.status_code == 404
        assert response.json()["detail"] == "Plot not found"


class TestCreatePlotStep:
    @patch("backend.app.router.sections.plot_router.PlotRepository")
    def test_create_plot_step_success(
        self, mock_repo_class, client, mock_session, mock_plot_step
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.create_plot_step = AsyncMock(return_value=mock_plot_step)

        request_data = {"plotID": 1}

        with patch(
            "backend.app.router.sections.plot_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.post("/plot/step/", json=request_data)

        # Assert
        assert response.status_code == 200
        response_data = response.json()
        assert response_data["id"] == 1
        assert response_data["plotID"] == 1
        assert response_data["name"] == "Test Step"
        mock_repo.create_plot_step.assert_called_once_with(1)

    @patch("backend.app.router.sections.plot_router.PlotRepository")
    def test_create_plot_step_database_error(
        self, mock_repo_class, client, mock_session
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.create_plot_step.side_effect = Exception("Database error")

        request_data = {"plotID": 1}

        with patch(
            "backend.app.router.sections.plot_router.get_session",
            return_value=mock_session,
        ):
            # Act & Assert
            with pytest.raises(Exception):
                client.post("/plot/step/", json=request_data)


class TestGetPlotStep:
    @patch("backend.app.router.sections.plot_router.PlotRepository")
    def test_get_plot_step_success(
        self, mock_repo_class, client, mock_session, mock_plot_step
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_plot_step = AsyncMock(return_value=mock_plot_step)

        with patch(
            "backend.app.router.sections.plot_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.get("/plot/step/1")

        # Assert
        assert response.status_code == 200
        response_data = response.json()
        assert response_data["id"] == 1
        assert response_data["plotID"] == 1
        assert response_data["name"] == "Test Step"
        mock_repo.get_plot_step.assert_called_once_with(1)

    @patch("backend.app.router.sections.plot_router.PlotRepository")
    def test_get_plot_step_not_found(self, mock_repo_class, client, mock_session):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_plot_step = AsyncMock(return_value=None)

        with patch(
            "backend.app.router.sections.plot_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.get("/plot/step/999")

        # Assert
        assert response.status_code == 404
        assert response.json()["detail"] == "Step not found"


class TestUpdatePlotStep:
    @patch("backend.app.router.sections.plot_router.PlotRepository")
    def test_update_plot_step_success(
        self, mock_repo_class, client, mock_session, mock_plot_step
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_plot_step = AsyncMock(return_value=mock_plot_step)
        mock_repo.update_plot_step = AsyncMock()

        # Mock the dict method
        mock_plot_step.dict = MagicMock(
            return_value={"name": "Updated Step", "goal": "Updated Goal"}
        )

        request_data = {"name": "Updated Step", "goal": "Updated Goal", "nextStepID": 2}

        with patch(
            "backend.app.router.sections.plot_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.patch("/plot/step/1", json=request_data)

        # Assert
        assert response.status_code == 200
        response_data = response.json()
        assert response_data["id"] == 1
        assert mock_plot_step.name == "Updated Step"
        assert mock_plot_step.goal == "Updated Goal"
        assert mock_plot_step.nextStepID == 2
        mock_repo.get_plot_step.assert_called_once_with(1)
        mock_repo.update_plot_step.assert_called_once_with(mock_plot_step)

    @patch("backend.app.router.sections.plot_router.PlotRepository")
    def test_update_plot_step_partial_update(
        self, mock_repo_class, client, mock_session, mock_plot_step
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_plot_step = AsyncMock(return_value=mock_plot_step)
        mock_repo.update_plot_step = AsyncMock()

        # Mock the dict method to return only the updated field
        mock_plot_step.dict = MagicMock(return_value={"name": "Only Name Updated"})

        original_goal = mock_plot_step.goal
        request_data = {"name": "Only Name Updated"}

        with patch(
            "backend.app.router.sections.plot_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.patch("/plot/step/1", json=request_data)

        # Assert
        assert response.status_code == 200
        assert mock_plot_step.name == "Only Name Updated"
        assert mock_plot_step.goal == original_goal  # Should remain unchanged

    @patch("backend.app.router.sections.plot_router.PlotRepository")
    def test_update_plot_step_not_found(self, mock_repo_class, client, mock_session):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_plot_step = AsyncMock(return_value=None)

        request_data = {"name": "Updated Step"}

        with patch(
            "backend.app.router.sections.plot_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.patch("/plot/step/999", json=request_data)

        # Assert
        assert response.status_code == 404
        assert response.json()["detail"] == "Step not found"


class TestDeletePlotStep:
    @patch("backend.app.router.sections.plot_router.PlotRepository")
    def test_delete_plot_step_success(
        self, mock_repo_class, client, mock_session, mock_plot_step
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_plot_step = AsyncMock(return_value=mock_plot_step)
        mock_repo.delete_plot_step = AsyncMock()

        with patch(
            "backend.app.router.sections.plot_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.delete("/plot/step/1")

        # Assert
        assert response.status_code == 204
        mock_repo.get_plot_step.assert_called_once_with(1)
        mock_repo.delete_plot_step.assert_called_once_with(mock_plot_step)

    @patch("backend.app.router.sections.plot_router.PlotRepository")
    def test_delete_plot_step_not_found(self, mock_repo_class, client, mock_session):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_plot_step = AsyncMock(return_value=None)

        with patch(
            "backend.app.router.sections.plot_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.delete("/plot/step/999")

        # Assert
        assert response.status_code == 404
        assert response.json()["detail"] == "Step not found"


# Test de integración con errores de base de datos
class TestDatabaseErrors:
    @patch("backend.app.router.sections.plot_router.PlotRepository")
    def test_get_plot_database_error(self, mock_repo_class, client, mock_session):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_plot.side_effect = Exception("Database connection error")

        with patch(
            "backend.app.router.sections.plot_router.get_session",
            return_value=mock_session,
        ):
            # Act & Assert
            with pytest.raises(Exception):
                client.get("/plot/1")

    @patch("backend.app.router.sections.plot_router.PlotRepository")
    def test_update_plot_database_error(
        self, mock_repo_class, client, mock_session, mock_plot
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_plot = AsyncMock(return_value=mock_plot)
        mock_repo.update_plot.side_effect = Exception("Database error")

        request_data = {"title": "Updated Title"}

        with patch(
            "backend.app.router.sections.plot_router.get_session",
            return_value=mock_session,
        ):
            # Act & Assert
            with pytest.raises(Exception):
                client.patch("/plot/1", json=request_data)

    @patch("backend.app.router.sections.plot_router.PlotRepository")
    def test_delete_plot_database_error(
        self, mock_repo_class, client, mock_session, mock_plot
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_plot = AsyncMock(return_value=mock_plot)
        mock_repo.delete_plot.side_effect = Exception("Database error")

        with patch(
            "backend.app.router.sections.plot_router.get_session",
            return_value=mock_session,
        ):
            # Act & Assert
            with pytest.raises(Exception):
                client.delete("/plot/1")


class TestPlotStepDatabaseErrors:
    @patch("backend.app.router.sections.plot_router.PlotRepository")
    def test_get_plot_step_database_error(self, mock_repo_class, client, mock_session):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_plot_step.side_effect = Exception("Database connection error")

        with patch(
            "backend.app.router.sections.plot_router.get_session",
            return_value=mock_session,
        ):
            # Act & Assert
            with pytest.raises(Exception):
                client.get("/plot/step/1")

    @patch("backend.app.router.sections.plot_router.PlotRepository")
    def test_update_plot_step_database_error(
        self, mock_repo_class, client, mock_session, mock_plot_step
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_plot_step = AsyncMock(return_value=mock_plot_step)
        mock_repo.update_plot_step.side_effect = Exception("Database error")

        # Mock the dict method
        mock_plot_step.dict = MagicMock(return_value={"name": "Updated Step"})

        request_data = {"name": "Updated Step"}

        with patch(
            "backend.app.router.sections.plot_router.get_session",
            return_value=mock_session,
        ):
            # Act & Assert
            with pytest.raises(Exception):
                client.patch("/plot/step/1", json=request_data)

    @patch("backend.app.router.sections.plot_router.PlotRepository")
    def test_delete_plot_step_database_error(
        self, mock_repo_class, client, mock_session, mock_plot_step
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_plot_step = AsyncMock(return_value=mock_plot_step)
        mock_repo.delete_plot_step.side_effect = Exception("Database error")

        with patch(
            "backend.app.router.sections.plot_router.get_session",
            return_value=mock_session,
        ):
            # Act & Assert
            with pytest.raises(Exception):
                client.delete("/plot/step/1")


# Tests de validación de datos
class TestDataValidation:
    def test_create_plot_missing_required_field(self, client, mock_session):
        # Arrange
        request_data = {}  # Missing baseWritingProjectID

        with patch(
            "backend.app.router.sections.plot_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.post("/plot/", json=request_data)

        # Assert
        assert response.status_code == 422

    def test_create_plot_step_missing_required_field(self, client, mock_session):
        # Arrange
        request_data = {}  # Missing plotID

        with patch(
            "backend.app.router.sections.plot_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.post("/plot/step/", json=request_data)

        # Assert
        assert response.status_code == 422

    def test_update_plot_invalid_data_types(self, client, mock_session):
        # Arrange
        request_data = {"importance": "not_an_integer"}  # Should be integer

        with patch(
            "backend.app.router.sections.plot_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.patch("/plot/1", json=request_data)

        # Assert
        assert response.status_code == 422
