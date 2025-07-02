import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.router.sections.character_router import character_router


# Mock dependencies
@pytest.fixture
def mock_session():
    return AsyncMock(spec=AsyncSession)


@pytest.fixture
def client():
    from fastapi import FastAPI

    app = FastAPI()
    app.include_router(character_router)
    return TestClient(app)


def create_mock_character_dict():
    """Create a dict that can be properly serialized by Pydantic"""
    return {
        "id": 1,
        "name": "Test Character",
        "importance": 5,
        "characteristics": "Brave and loyal",
        "motivation": "Save the world",
        "objetive": "Find the artifact",
        "conflict": "Internal struggle",
        "epiphany": "Realizes true strength",
        "resumePhrase": "A brave hero",
        "resumeParagraph": "A detailed description",
        "resume": "Full character background",
        "notes": "Character notes",
        "details": "Additional details",
        "baseWritingProjectID": 1,
        "plotID": None,
    }


@pytest.fixture
def mock_character():
    """Mock character object with all required fields"""
    character = MagicMock()

    # Set all attributes to actual values instead of MagicMock objects
    character.id = 1
    character.name = "Test Character"
    character.importance = 5
    character.characteristics = "Brave and loyal"
    character.motivation = "Save the world"
    character.objetive = "Find the artifact"
    character.conflict = "Internal struggle"
    character.epiphany = "Realizes true strength"
    character.resumePhrase = "A brave hero"
    character.resumeParagraph = "A detailed description"
    character.resume = "Full character background"
    character.notes = "Character notes"
    character.details = "Additional details"
    character.baseWritingProjectID = 1
    character.plotID = None

    return character


class TestCreateCharacter:
    @patch("backend.app.router.sections.character_router.CharacterRepository")
    def test_create_character_success(
        self, mock_repo_class, client, mock_session, mock_character
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.create_character = AsyncMock(return_value=mock_character)

        request_data = {"baseWritingProjectID": 1}

        with patch(
            "backend.app.router.sections.character_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.post("/characters/", json=request_data)

        # Assert
        assert response.status_code == 200
        response_data = response.json()
        assert response_data["id"] == 1
        assert response_data["name"] == "Test Character"
        assert response_data["baseWritingProjectID"] == 1
        mock_repo.create_character.assert_called_once_with(1)

    @patch("backend.app.router.sections.character_router.CharacterRepository")
    def test_create_character_database_error(
        self, mock_repo_class, client, mock_session
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.create_character.side_effect = Exception("Database error")

        request_data = {"baseWritingProjectID": 1}

        with patch(
            "backend.app.router.sections.character_router.get_session",
            return_value=mock_session,
        ):
            # Act & Assert
            with pytest.raises(Exception):
                client.post("/characters/", json=request_data)


class TestGetCharacter:
    @patch("backend.app.router.sections.character_router.CharacterRepository")
    def test_get_character_success(
        self, mock_repo_class, client, mock_session, mock_character
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo

        # Usar AsyncMock en lugar de función regular
        mock_repo.get_character = AsyncMock(return_value=mock_character)

        with patch(
            "backend.app.router.sections.character_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.get("/characters/1")

        # Assert
        assert response.status_code == 200
        response_data = response.json()
        assert response_data["id"] == 1
        assert response_data["name"] == "Test Character"
        mock_repo.get_character.assert_called_once_with(1)

    @patch("backend.app.router.sections.character_router.CharacterRepository")
    def test_get_character_not_found(self, mock_repo_class, client, mock_session):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo

        # Usar AsyncMock en lugar de función regular
        mock_repo.get_character = AsyncMock(return_value=None)

        with patch(
            "backend.app.router.sections.character_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.get("/characters/999")

        # Assert
        assert response.status_code == 404
        assert response.json()["detail"] == "Character not found"
        mock_repo.get_character.assert_called_once_with(999)


class TestGetCharactersFromProject:
    @patch("backend.app.router.sections.character_router.CharacterRepository")
    def test_get_characters_from_project_success(
        self, mock_repo_class, client, mock_session, mock_character
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo

        # Create multiple mock characters
        mock_character_2 = MagicMock()
        mock_character_2.id = 2
        mock_character_2.name = "Second Character"
        mock_character_2.importance = 3
        mock_character_2.characteristics = "Wise and old"
        mock_character_2.motivation = "Guide the hero"
        mock_character_2.objetive = "Share knowledge"
        mock_character_2.conflict = "Past mistakes"
        mock_character_2.epiphany = "Forgiveness"
        mock_character_2.resumePhrase = "A wise mentor"
        mock_character_2.resumeParagraph = "An experienced guide"
        mock_character_2.resume = "Mentor background"
        mock_character_2.notes = "Mentor notes"
        mock_character_2.details = "Mentor details"
        mock_character_2.baseWritingProjectID = 1
        mock_character_2.plotID = None

        characters_list = [mock_character, mock_character_2]
        mock_repo.get_list_by_project_id = AsyncMock(return_value=characters_list)

        with patch(
            "backend.app.router.sections.character_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.get("/characters/from_project/1")

        # Assert
        assert response.status_code == 200
        response_data = response.json()
        assert len(response_data) == 2
        assert response_data[0]["id"] == 1
        assert response_data[1]["id"] == 2
        mock_repo.get_list_by_project_id.assert_called_once_with(1)

    @patch("backend.app.router.sections.character_router.CharacterRepository")
    def test_get_characters_from_project_empty_list(
        self, mock_repo_class, client, mock_session
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_list_by_project_id = AsyncMock(return_value=[])

        with patch(
            "backend.app.router.sections.character_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.get("/characters/from_project/1")

        # Assert
        assert response.status_code == 200
        response_data = response.json()
        assert len(response_data) == 0
        assert response_data == []
        mock_repo.get_list_by_project_id.assert_called_once_with(1)


class TestDeleteCharacter:
    @patch("backend.app.router.sections.character_router.CharacterRepository")
    def test_delete_character_success(
        self, mock_repo_class, client, mock_session, mock_character
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_character = AsyncMock(return_value=mock_character)
        mock_repo.delete_character = AsyncMock()

        with patch(
            "backend.app.router.sections.character_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.delete("/characters/1")

        # Assert
        assert response.status_code == 204
        mock_repo.get_character.assert_called_once_with(1)
        mock_repo.delete_character.assert_called_once_with(mock_character)

    @patch("backend.app.router.sections.character_router.CharacterRepository")
    def test_delete_character_not_found(self, mock_repo_class, client, mock_session):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_character = AsyncMock(return_value=None)

        with patch(
            "backend.app.router.sections.character_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.delete("/characters/999")

        # Assert
        assert response.status_code == 404
        assert response.json()["detail"] == "Character not found"
        mock_repo.get_character.assert_called_once_with(999)


class TestUpdateCharacter:
    @patch("backend.app.router.sections.character_router.CharacterRepository")
    def test_update_character_success(
        self, mock_repo_class, client, mock_session, mock_character
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_character = AsyncMock(return_value=mock_character)
        mock_repo.update_character = AsyncMock()

        request_data = {
            "name": "Updated Character Name",
            "importance": 8,
            "characteristics": "Updated characteristics",
        }

        with patch(
            "backend.app.router.sections.character_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.patch("/characters/1", json=request_data)

        # Assert
        assert response.status_code == 200
        response_data = response.json()

        # Check that the character attributes were updated
        assert mock_character.name == "Updated Character Name"
        assert mock_character.importance == 8
        assert mock_character.characteristics == "Updated characteristics"

        mock_repo.get_character.assert_called_once_with(1)
        mock_repo.update_character.assert_called_once_with(mock_character)

    @patch("backend.app.router.sections.character_router.CharacterRepository")
    def test_update_character_partial_update(
        self, mock_repo_class, client, mock_session, mock_character
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_character = AsyncMock(return_value=mock_character)
        mock_repo.update_character = AsyncMock()

        original_importance = mock_character.importance
        original_characteristics = mock_character.characteristics

        request_data = {
            "name": "Partially Updated Name"
            # Only updating name, other fields should remain unchanged
        }

        with patch(
            "backend.app.router.sections.character_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.patch("/characters/1", json=request_data)

        # Assert
        assert response.status_code == 200

        # Check that only the specified field was updated
        assert mock_character.name == "Partially Updated Name"
        assert (
            mock_character.importance == original_importance
        )  # Should remain unchanged
        assert (
            mock_character.characteristics == original_characteristics
        )  # Should remain unchanged

        mock_repo.get_character.assert_called_once_with(1)
        mock_repo.update_character.assert_called_once_with(mock_character)

    @patch("backend.app.router.sections.character_router.CharacterRepository")
    def test_update_character_not_found(self, mock_repo_class, client, mock_session):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_character = AsyncMock(return_value=None)

        request_data = {"name": "Updated Name"}

        with patch(
            "backend.app.router.sections.character_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.patch("/characters/999", json=request_data)

        # Assert
        assert response.status_code == 404
        assert response.json()["detail"] == "Character not found"
        mock_repo.get_character.assert_called_once_with(999)

    @patch("backend.app.router.sections.character_router.CharacterRepository")
    def test_update_character_all_fields(
        self, mock_repo_class, client, mock_session, mock_character
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_character = AsyncMock(return_value=mock_character)
        mock_repo.update_character = AsyncMock()

        request_data = {
            "name": "Completely Updated Character",
            "importance": 10,
            "characteristics": "New characteristics",
            "motivation": "New motivation",
            "objetive": "New objective",
            "conflict": "New conflict",
            "epiphany": "New epiphany",
            "resume_frase": "New resume phrase",
            "resume_paragraph": "New resume paragraph",
            "resume": "New full resume",
            "notes": "New notes",
            "details": "New details",
        }

        with patch(
            "backend.app.router.sections.character_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.patch("/characters/1", json=request_data)

        # Assert
        assert response.status_code == 200

        # Check that all fields were updated
        assert mock_character.name == "Completely Updated Character"
        assert mock_character.importance == 10
        assert mock_character.characteristics == "New characteristics"
        assert mock_character.motivation == "New motivation"
        assert mock_character.objetive == "New objective"
        assert mock_character.conflict == "New conflict"
        assert mock_character.epiphany == "New epiphany"
        assert mock_character.resume_frase == "New resume phrase"
        assert mock_character.resume_paragraph == "New resume paragraph"
        assert mock_character.resume == "New full resume"
        assert mock_character.notes == "New notes"
        assert mock_character.details == "New details"

        mock_repo.get_character.assert_called_once_with(1)
        mock_repo.update_character.assert_called_once_with(mock_character)


# Test de integración con errores de base de datos
class TestDatabaseErrors:
    @patch("backend.app.router.sections.character_router.CharacterRepository")
    def test_get_character_database_error(self, mock_repo_class, client, mock_session):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo

        def mock_get_character_error(character_id):
            raise Exception("Database connection error")

        mock_repo.get_character = mock_get_character_error

        with patch(
            "backend.app.router.sections.character_router.get_session",
            return_value=mock_session,
        ):
            # Act & Assert
            with pytest.raises(Exception):
                client.get("/characters/1")

    @patch("backend.app.router.sections.character_router.CharacterRepository")
    def test_get_characters_from_project_database_error(
        self, mock_repo_class, client, mock_session
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_list_by_project_id.side_effect = Exception(
            "Database connection error"
        )

        with patch(
            "backend.app.router.sections.character_router.get_session",
            return_value=mock_session,
        ):
            # Act & Assert
            with pytest.raises(Exception):
                client.get("/characters/from_project/1")

    @patch("backend.app.router.sections.character_router.CharacterRepository")
    def test_update_character_database_error(
        self, mock_repo_class, client, mock_session, mock_character
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_character = AsyncMock(return_value=mock_character)
        mock_repo.update_character.side_effect = Exception("Database error")

        request_data = {"name": "Updated Name"}

        with patch(
            "backend.app.router.sections.character_router.get_session",
            return_value=mock_session,
        ):
            # Act & Assert
            with pytest.raises(Exception):
                client.patch("/characters/1", json=request_data)

    @patch("backend.app.router.sections.character_router.CharacterRepository")
    def test_delete_character_database_error(
        self, mock_repo_class, client, mock_session, mock_character
    ):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_character = AsyncMock(return_value=mock_character)
        mock_repo.delete_character.side_effect = Exception("Database error")

        with patch(
            "backend.app.router.sections.character_router.get_session",
            return_value=mock_session,
        ):
            # Act & Assert
            with pytest.raises(Exception):
                client.delete("/characters/1")


# Tests de validación de esquemas
class TestSchemaValidation:
    def test_create_character_invalid_data(self, client):
        # Arrange
        invalid_request_data = {
            "invalid_field": "invalid_value"
            # Missing required baseWritingProjectID
        }

        # Act
        response = client.post("/characters/", json=invalid_request_data)

        # Assert
        assert response.status_code == 422  # Validation error

    @patch("backend.app.router.sections.character_router.CharacterRepository")
    def test_update_character_empty_data(
        self, mock_repo_class, client, mock_session, mock_character
    ):
        # Arrange
        request_data = {}  # Empty update data should still work

        mock_repo = AsyncMock()
        mock_repo_class.return_value = mock_repo

        mock_repo.get_character = AsyncMock(return_value=mock_character)
        mock_repo.update_character = AsyncMock()

        with patch(
            "backend.app.router.sections.character_router.get_session",
            return_value=mock_session,
        ):
            # Act
            response = client.patch("/characters/1", json=request_data)

        # Assert
        assert response.status_code == 200
        response_data = response.json()
        # Verificar que se devolvió el character con todos los campos requeridos
        assert response_data["id"] == 1
        assert "name" in response_data
        assert "baseWritingProjectID" in response_data
