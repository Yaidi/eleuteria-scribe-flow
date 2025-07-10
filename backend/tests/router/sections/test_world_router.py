import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.router.sections.world_router import world_router


# Mock dependencies
@pytest.fixture
def mock_session():
    return AsyncMock(spec=AsyncSession)


@pytest.fixture
def client():
    from fastapi import FastAPI

    app = FastAPI()
    app.include_router(world_router)
    return TestClient(app)


@pytest.fixture
def mock_world():
    """Mock world object with all required fields"""
    world = MagicMock()
    world.id = 1
    world.projectID = 1
    return world


@pytest.fixture
def mock_world_element():
    """Mock world element object with all required fields"""
    element = MagicMock()
    element.id = 1
    element.name = "Test Element"
    element.description = "Test description"
    element.origin = "Test origin"
    element.conflictCause = "Test conflict"
    element.worldElementID = None
    element.worldID = 1  # ✅ Asegurar que worldID sea un entero válido
    return element


class TestCreateWorld:
    @patch("backend.app.router.sections.world_router.WorldRepository")
    def test_create_world_success(
        self, mock_repo_class, client, mock_session, mock_world
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.create_world = AsyncMock(return_value=mock_world)
        mock_repo.get_world_by_project_id = AsyncMock(return_value=None)

        request_data = {"projectID": 1}

        with patch(
            "backend.app.router.sections.world_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.post("/world/", json=request_data)

        # Assert
        assert response.status_code == 200  # Verificar que sea un éxito
        response_data = response.json()
        assert response_data["id"] == 1
        assert response_data["projectID"] == 1
        mock_repo.create_world.assert_called_once_with(1)
        mock_repo.get_world_by_project_id.assert_called_once_with(1)  # Validar llamada

    @patch("backend.app.router.sections.world_router.WorldRepository")
    def test_create_world_database_error(self, mock_repo_class, client, mock_session):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        # Simular error al intentar crear el mundo
        mock_repo.get_world_by_project_id = AsyncMock(
            return_value=None
        )  # Asegurarse de que no existe
        mock_repo.create_world.side_effect = Exception("Database error")

        request_data = {"projectID": 1}

        with patch(
            "backend.app.router.sections.world_router.get_session",
            return_value=mock_session,
        ):
            # Act & Assert
            with pytest.raises(Exception):
                client.post("/world/", json=request_data)


class TestGetWorld:
    @patch("backend.app.router.sections.world_router.WorldRepository")
    def test_get_world_success(
        self, mock_repo_class, client, mock_session, mock_world, mock_world_element
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_world = AsyncMock(return_value=mock_world)
        mock_repo.get_world_elements = AsyncMock(return_value=[mock_world_element])

        with patch(
            "backend.app.router.sections.world_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.get("/world/1")

        # Assert
        assert response.status_code == 200
        response_data = response.json()
        assert response_data["id"] == 1
        assert len(response_data["world_elements"]) == 1
        assert response_data["world_elements"][0]["id"] == 1
        mock_repo.get_world.assert_called_once_with(1)
        mock_repo.get_world_elements.assert_called_once_with(world_id=1)

    @patch("backend.app.router.sections.world_router.WorldRepository")
    def test_get_world_success_empty_elements(
        self, mock_repo_class, client, mock_session, mock_world
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_world = AsyncMock(return_value=mock_world)
        mock_repo.get_world_elements = AsyncMock(return_value=[])

        with patch(
            "backend.app.router.sections.world_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.get("/world/1")

        # Assert
        assert response.status_code == 200
        response_data = response.json()
        assert response_data["id"] == 1
        assert response_data["world_elements"] == []
        mock_repo.get_world.assert_called_once_with(1)
        mock_repo.get_world_elements.assert_called_once_with(world_id=1)

    @patch("backend.app.router.sections.world_router.WorldRepository")
    def test_get_world_not_found(self, mock_repo_class, client, mock_session):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_world = AsyncMock(return_value=None)

        with patch(
            "backend.app.router.sections.world_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.get("/world/999")

        # Assert
        assert response.status_code == 404
        assert response.json()["detail"] == "World not found"
        mock_repo.get_world.assert_called_once_with(999)


class TestGetWorldByProjectId:
    @patch("backend.app.router.sections.world_router.WorldRepository")
    def test_get_world_by_project_id_success(
        self, mock_repo_class, client, mock_session, mock_world, mock_world_element
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_world_by_project_id = AsyncMock(return_value=mock_world)
        mock_repo.get_world_elements = AsyncMock(return_value=[mock_world_element])

        with patch(
            "backend.app.router.sections.world_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.get("/world/from_project/1")

        # Assert
        assert response.status_code == 200
        response_data = response.json()
        assert response_data["id"] == 1
        assert len(response_data["world_elements"]) == 1
        mock_repo.get_world_by_project_id.assert_called_once_with(1)
        mock_repo.get_world_elements.assert_called_once_with(world_id=1)

    @patch("backend.app.router.sections.world_router.WorldRepository")
    def test_get_world_by_project_id_not_found(
        self, mock_repo_class, client, mock_session
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_world_by_project_id = AsyncMock(return_value=None)

        with patch(
            "backend.app.router.sections.world_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.get("/world/from_project/999")

        # Assert
        assert response.status_code == 404
        assert response.json()["detail"] == "World not found"
        mock_repo.get_world_by_project_id.assert_called_once_with(999)


class TestDeleteWorld:
    @patch("backend.app.router.sections.world_router.WorldRepository")
    def test_delete_world_success(
        self, mock_repo_class, client, mock_session, mock_world
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_world = AsyncMock(return_value=mock_world)
        mock_repo.delete_world = AsyncMock()

        with patch(
            "backend.app.router.sections.world_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.delete("/world/1")

        # Assert
        assert response.status_code == 200
        mock_repo.get_world.assert_called_once_with(1)
        mock_repo.delete_world.assert_called_once_with(mock_world)

    @patch("backend.app.router.sections.world_router.WorldRepository")
    def test_delete_world_not_found(self, mock_repo_class, client, mock_session):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_world = AsyncMock(return_value=None)

        with patch(
            "backend.app.router.sections.world_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.delete("/world/999")

        # Assert
        assert response.status_code == 404
        assert response.json()["detail"] == "World not found"
        mock_repo.get_world.assert_called_once_with(999)


class TestUpdateWorld:
    @patch("backend.app.router.sections.world_router.WorldRepository")
    def test_update_world_success(
        self, mock_repo_class, client, mock_session, mock_world
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_world = AsyncMock(return_value=mock_world)
        mock_repo.update_world = AsyncMock()

        request_data = {"projectID": 2}

        with patch(
            "backend.app.router.sections.world_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.put("/world/1", json=request_data)

        # Assert
        assert response.status_code == 200
        response_data = response.json()
        assert response_data["id"] == 1
        # Check that the world attributes were updated
        assert mock_world.projectID == 2
        mock_repo.get_world.assert_called_once_with(1)
        mock_repo.update_world.assert_called_once_with(mock_world)

    @patch("backend.app.router.sections.world_router.WorldRepository")
    def test_update_world_not_found(self, mock_repo_class, client, mock_session):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_world = AsyncMock(return_value=None)

        request_data = {"projectID": 2}

        with patch(
            "backend.app.router.sections.world_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.put("/world/999", json=request_data)

        # Assert
        assert response.status_code == 404
        assert response.json()["detail"] == "World not found"
        mock_repo.get_world.assert_called_once_with(999)


class TestCreateWorldElement:
    @patch("backend.app.router.sections.world_router.WorldRepository")
    def test_create_world_element_success(
        self, mock_repo_class, client, mock_session, mock_world_element
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.create_world_element = AsyncMock(return_value=mock_world_element)

        request_data = {"worldID": 1}

        with patch(
            "backend.app.router.sections.world_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.post("/world/element", json=request_data)

        # Assert
        assert response.status_code == 200
        response_data = response.json()
        assert response_data["id"] == 1
        assert response_data["worldID"] == 1
        mock_repo.create_world_element.assert_called_once_with(world_id=1)

    @patch("backend.app.router.sections.world_router.WorldRepository")
    def test_create_world_element_database_error(
        self, mock_repo_class, client, mock_session
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.create_world_element.side_effect = Exception("Database error")

        request_data = {"worldID": 1}

        with patch(
            "backend.app.router.sections.world_router.get_session",
            return_value=mock_session,
        ):
            # Act & Assert
            with pytest.raises(Exception):
                client.post("/world/element", json=request_data)


class TestGetWorldElement:
    @patch("backend.app.router.sections.world_router.WorldRepository")
    def test_get_world_element_success(
        self, mock_repo_class, client, mock_session, mock_world_element
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_world_element = AsyncMock(return_value=mock_world_element)

        with patch(
            "backend.app.router.sections.world_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.get("/world/element/1")

        # Assert
        assert response.status_code == 200
        response_data = response.json()
        assert response_data["id"] == 1
        assert response_data["name"] == "Test Element"
        mock_repo.get_world_element.assert_called_once_with(1)

    @patch("backend.app.router.sections.world_router.WorldRepository")
    def test_get_world_element_not_found(self, mock_repo_class, client, mock_session):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_world_element = AsyncMock(return_value=None)

        with patch(
            "backend.app.router.sections.world_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.get("/world/element/999")

        # Assert
        assert response.status_code == 404
        assert response.json()["detail"] == "Element not found"
        mock_repo.get_world_element.assert_called_once_with(999)


class TestGetWorldElementsByWorldId:
    @patch("backend.app.router.sections.world_router.WorldRepository")
    def test_get_world_elements_by_world_id_success(
        self, mock_repo_class, client, mock_session, mock_world_element
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo

        # Create multiple mock elements
        mock_element_2 = MagicMock()
        mock_element_2.id = 2
        mock_element_2.name = "Second Element"
        mock_element_2.description = "Second description"
        mock_element_2.origin = "Second origin"
        mock_element_2.conflictCause = "Second conflict"
        mock_element_2.worldElementID = None
        mock_element_2.worldID = 1

        elements_list = [mock_world_element, mock_element_2]
        mock_repo.get_world_elements = AsyncMock(return_value=elements_list)

        with patch(
            "backend.app.router.sections.world_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.get("/world/elements/from_world/1")

        # Assert
        assert response.status_code == 200
        response_data = response.json()
        assert len(response_data) == 2
        assert response_data[0]["id"] == 1
        assert response_data[1]["id"] == 2
        mock_repo.get_world_elements.assert_called_once_with(world_id=1)

    @patch("backend.app.router.sections.world_router.WorldRepository")
    def test_get_world_elements_by_world_id_not_found(
        self, mock_repo_class, client, mock_session
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_world_elements = AsyncMock(return_value=[])

        with patch(
            "backend.app.router.sections.world_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.get("/world/elements/from_world/999")

        # Assert
        assert response.status_code == 404
        assert response.json()["detail"] == "Elements not found"
        mock_repo.get_world_elements.assert_called_once_with(world_id=999)


class TestGetNestedWorldElements:
    @patch("backend.app.router.sections.world_router.WorldRepository")
    def test_get_nested_world_elements_success(
        self, mock_repo_class, client, mock_session, mock_world_element
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo

        # Create nested element
        mock_nested_element = MagicMock()
        mock_nested_element.id = 2
        mock_nested_element.name = "Nested Element"
        mock_nested_element.description = "Nested description"
        mock_nested_element.origin = "Nested origin"
        mock_nested_element.conflictCause = "Nested conflict"
        mock_nested_element.worldElementID = 1  # Child of element 1
        mock_nested_element.worldID = 1

        nested_elements = [mock_nested_element]
        mock_repo.get_nested_world_elements = AsyncMock(return_value=nested_elements)

        with patch(
            "backend.app.router.sections.world_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.get("/world/nested_elements/element/1")

        # Assert
        assert response.status_code == 200
        response_data = response.json()
        assert len(response_data) == 1
        assert response_data[0]["id"] == 2
        assert response_data[0]["worldElementID"] == 1
        mock_repo.get_nested_world_elements.assert_called_once_with(world_element_id=1)

    @patch("backend.app.router.sections.world_router.WorldRepository")
    def test_get_nested_world_elements_not_found(
        self, mock_repo_class, client, mock_session
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_nested_world_elements = AsyncMock(return_value=[])

        with patch(
            "backend.app.router.sections.world_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.get("/world/nested_elements/element/999")

        # Assert
        assert response.status_code == 404
        assert response.json()["detail"] == "Elements not found"
        mock_repo.get_nested_world_elements.assert_called_once_with(
            world_element_id=999
        )


class TestDeleteWorldElement:
    @patch("backend.app.router.sections.world_router.WorldRepository")
    def test_delete_world_element_success(
        self, mock_repo_class, client, mock_session, mock_world_element
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_world_element = AsyncMock(return_value=mock_world_element)
        mock_repo.delete_world_element = AsyncMock()

        with patch(
            "backend.app.router.sections.world_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.delete("/world/element/1")

        # Assert
        assert response.status_code == 200
        mock_repo.get_world_element.assert_called_once_with(1)
        mock_repo.delete_world_element.assert_called_once_with(mock_world_element)

    @patch("backend.app.router.sections.world_router.WorldRepository")
    def test_delete_world_element_not_found(
        self, mock_repo_class, client, mock_session
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_world_element = AsyncMock(return_value=None)

        with patch(
            "backend.app.router.sections.world_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.delete("/world/element/999")

        # Assert
        assert response.status_code == 404
        assert response.json()["detail"] == "Element not found"
        mock_repo.get_world_element.assert_called_once_with(999)


class TestUpdateWorldElement:
    @patch("backend.app.router.sections.world_router.WorldRepository")
    def test_update_world_element_success(self, mock_repo_class, client, mock_session):
        # Arrange
        # ✅ Usar PropertyMock para preservar propiedades automáticamente
        mock_world_element = MagicMock()
        # Configurar valores iniciales que se mantienen a menos que se actualicen
        type(mock_world_element).id = 1
        type(mock_world_element).name = "Original Name"
        type(mock_world_element).description = "Original description"
        type(mock_world_element).origin = "Original origin"
        type(mock_world_element).conflictCause = "Original conflict"
        type(mock_world_element).worldElementID = None
        type(mock_world_element).worldID = 1  # ✅ Este NO se sobrescribirá

        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_world_element = AsyncMock(return_value=mock_world_element)
        mock_repo.update_world_element = AsyncMock()

        request_data = {
            "name": "Updated Element Name",
            "description": "Updated description",
            "origin": "Updated origin",
            "worldID": 1,
        }

        with patch(
            "backend.app.router.sections.world_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.put("/world/element/1", json=request_data)

        # Assert
        assert response.status_code == 200

        # Verificar que las propiedades fueron actualizadas correctamente
        assert mock_world_element.name == "Updated Element Name"
        assert mock_world_element.description == "Updated description"
        assert mock_world_element.origin == "Updated origin"
        # ✅ worldID se mantiene sin cambios
        assert mock_world_element.worldID == 1

        mock_repo.get_world_element.assert_called_once_with(element_id=1)
        mock_repo.update_world_element.assert_called_once_with(mock_world_element)

    @patch("backend.app.router.sections.world_router.WorldRepository")
    def test_update_world_element_partial_update(
        self, mock_repo_class, client, mock_session
    ):
        # Arrange
        # ✅ Usar PropertyMock para preservar propiedades automáticamente
        mock_world_element = MagicMock()
        type(mock_world_element).id = 1
        type(mock_world_element).name = "Original Name"
        type(mock_world_element).description = "Original description"
        type(mock_world_element).origin = "Original origin"
        type(mock_world_element).conflictCause = "Original conflict"
        type(mock_world_element).worldElementID = None
        type(mock_world_element).worldID = 1  # ✅ Este NO se sobrescribirá

        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_world_element = AsyncMock(return_value=mock_world_element)
        mock_repo.update_world_element = AsyncMock()

        request_data = {
            "name": "Partially Updated Name",
            "worldID": 1,
            # Solo se actualiza name, otros campos deben permanecer sin cambios
        }

        with patch(
            "backend.app.router.sections.world_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.put("/world/element/1", json=request_data)

        # Assert
        assert response.status_code == 200

        # Verificar que solo el nombre fue actualizado
        assert mock_world_element.name == "Partially Updated Name"
        # ✅ worldID se mantiene sin cambios
        assert mock_world_element.worldID == 1

        mock_repo.get_world_element.assert_called_once_with(element_id=1)
        mock_repo.update_world_element.assert_called_once_with(mock_world_element)

    @patch("backend.app.router.sections.world_router.WorldRepository")
    def test_update_world_element_not_found(
        self, mock_repo_class, client, mock_session
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_world_element = AsyncMock(return_value=None)

        request_data = {"name": "Updated Name", "worldID": 1}

        with patch(
            "backend.app.router.sections.world_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.put("/world/element/999", json=request_data)

        # Assert
        assert response.status_code == 404
        assert response.json()["detail"] == "Element not found"
        mock_repo.get_world_element.assert_called_once_with(element_id=999)

    @patch("backend.app.router.sections.world_router.WorldRepository")
    def test_update_world_element_all_fields(
        self, mock_repo_class, client, mock_session
    ):
        # Arrange
        # ✅ Usar PropertyMock para preservar propiedades automáticamente
        mock_world_element = MagicMock()
        type(mock_world_element).id = 1
        type(mock_world_element).name = "Original Name"
        type(mock_world_element).description = "Original description"
        type(mock_world_element).origin = "Original origin"
        type(mock_world_element).conflictCause = "Original conflict"
        type(mock_world_element).worldElementID = None
        type(mock_world_element).worldID = 1

        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_world_element = AsyncMock(return_value=mock_world_element)
        mock_repo.update_world_element = AsyncMock()

        request_data = {
            "name": "Completely Updated Element",
            "description": "New description",
            "origin": "New origin",
            "conflictCause": "New conflict cause",
            "worldElementID": 5,
            "worldID": 2,
        }

        with patch(
            "backend.app.router.sections.world_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.put("/world/element/1", json=request_data)

        # Assert
        assert response.status_code == 200

        # Verificar que todos los campos fueron actualizados
        assert mock_world_element.name == "Completely Updated Element"
        assert mock_world_element.description == "New description"
        assert mock_world_element.origin == "New origin"
        assert mock_world_element.conflictCause == "New conflict cause"
        assert mock_world_element.worldElementID == 5
        assert mock_world_element.worldID == 2

        mock_repo.get_world_element.assert_called_once_with(element_id=1)
        mock_repo.update_world_element.assert_called_once_with(mock_world_element)


# Test de integración con errores de base de datos
class TestDatabaseErrors:
    @patch("backend.app.router.sections.world_router.WorldRepository")
    def test_get_world_database_error(self, mock_repo_class, client, mock_session):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_world.side_effect = Exception("Database connection error")

        with patch(
            "backend.app.router.sections.world_router.get_session",
            return_value=mock_session,
        ):
            # Act & Assert
            with pytest.raises(Exception):
                client.get("/world/1")

    @patch("backend.app.router.sections.world_router.WorldRepository")
    def test_get_world_elements_database_error(
        self, mock_repo_class, client, mock_session
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_world_elements.side_effect = Exception(
            "Database connection error"
        )

        with patch(
            "backend.app.router.sections.world_router.get_session",
            return_value=mock_session,
        ):
            # Act & Assert
            with pytest.raises(Exception):
                client.get("/world/elements/from_world/1")

    @patch("backend.app.router.sections.world_router.WorldRepository")
    def test_update_world_database_error(
        self, mock_repo_class, client, mock_session, mock_world
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_world = AsyncMock(return_value=mock_world)
        mock_repo.update_world.side_effect = Exception("Database error")

        request_data = {"projectID": 2}

        with patch(
            "backend.app.router.sections.world_router.get_session",
            return_value=mock_session,
        ):
            # Act & Assert
            with pytest.raises(Exception):
                client.put("/world/1", json=request_data)

    @patch("backend.app.router.sections.world_router.WorldRepository")
    def test_delete_world_database_error(
        self, mock_repo_class, client, mock_session, mock_world
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_world = AsyncMock(return_value=mock_world)
        mock_repo.delete_world.side_effect = Exception("Database error")

        with patch(
            "backend.app.router.sections.world_router.get_session",
            return_value=mock_session,
        ):
            # Act & Assert
            with pytest.raises(Exception):
                client.delete("/world/1")

    @patch("backend.app.router.sections.world_router.WorldRepository")
    def test_update_world_element_database_error(
        self, mock_repo_class, client, mock_session
    ):
        # Arrange
        # ✅ Usar PropertyMock para preservar propiedades automáticamente
        mock_world_element = MagicMock()
        type(mock_world_element).id = 1
        type(mock_world_element).name = "Test Element"
        type(mock_world_element).description = "Test description"
        type(mock_world_element).origin = "Test origin"
        type(mock_world_element).conflictCause = "Test conflict"
        type(mock_world_element).worldElementID = None
        type(mock_world_element).worldID = 1

        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_world_element = AsyncMock(return_value=mock_world_element)
        mock_repo.update_world_element.side_effect = Exception("Database error")

        request_data = {"name": "Updated Name", "worldID": 1}

        with patch(
            "backend.app.router.sections.world_router.get_session",
            return_value=mock_session,
        ):
            # Act & Assert
            with pytest.raises(Exception):
                client.put("/world/element/1", json=request_data)

    @patch("backend.app.router.sections.world_router.WorldRepository")
    def test_delete_world_element_database_error(
        self, mock_repo_class, client, mock_session, mock_world_element
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_world_element = AsyncMock(return_value=mock_world_element)
        mock_repo.delete_world_element.side_effect = Exception("Database error")

        with patch(
            "backend.app.router.sections.world_router.get_session",
            return_value=mock_session,
        ):
            # Act & Assert
            with pytest.raises(Exception):
                client.delete("/world/element/1")


# Tests de validación de esquemas
class TestSchemaValidation:
    def test_create_world_invalid_data(self, client):
        # Arrange
        invalid_request_data = {
            "invalid_field": "invalid_value"
            # Missing required projectID
        }

        # Act
        response = client.post("/world/", json=invalid_request_data)

        # Assert
        assert response.status_code == 422  # Validation error

    def test_create_world_element_invalid_data(self, client):
        # Arrange
        invalid_request_data = {
            "invalid_field": "invalid_value"
            # Missing required worldID
        }

        # Act
        response = client.post("/world/element", json=invalid_request_data)

        # Assert
        assert response.status_code == 422  # Validation error

    @patch("backend.app.router.sections.world_router.WorldRepository")
    def test_update_world_element_empty_data(
        self, mock_repo_class, client, mock_session
    ):
        # Arrange
        request_data = {}  # Empty update data

        # ✅ Usar PropertyMock para preservar propiedades automáticamente
        mock_world_element = MagicMock()
        type(mock_world_element).id = 1
        type(mock_world_element).name = "Test Element"
        type(mock_world_element).description = "Test description"
        type(mock_world_element).origin = "Test origin"
        type(mock_world_element).conflictCause = "Test conflict"
        type(mock_world_element).worldElementID = None
        type(mock_world_element).worldID = 1  # ✅ Campo requerido preservado

        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo

        mock_repo.get_world_element = AsyncMock(return_value=mock_world_element)
        mock_repo.update_world_element = AsyncMock()

        with patch(
            "backend.app.router.sections.world_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.put("/world/element/1", json=request_data)

        # Assert
        assert response.status_code == 422
