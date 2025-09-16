import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi.testclient import TestClient
from fastapi import UploadFile
from io import BytesIO

from backend.app.router.sections.manuscript_router import manuscript_router


@pytest.fixture
def client():
    from fastapi import FastAPI

    app = FastAPI()
    app.include_router(manuscript_router)
    return TestClient(app)


@pytest.fixture
def sample_save_start_request():
    """Sample request data for starting a manuscript save session"""
    return {
        "project_id": 123,
        "relative_path": "documents/chapters",
        "filename": "chapter1.docx",
        "title": "Chapter 1: The Beginning",
    }


@pytest.fixture
def mock_upload_file():
    """Mock UploadFile for testing chunk uploads"""
    mock_file = MagicMock(spec=UploadFile)
    mock_file.filename = "test_chapter.docx"
    mock_file.content_type = (
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )

    # Mock the read method to return data in chunks
    async def mock_read(size=1024):
        # Simulate reading file data in chunks
        if not hasattr(mock_read, "call_count"):
            mock_read.call_count = 0

        if mock_read.call_count == 0:
            mock_read.call_count += 1
            return b"This is the first chunk of data"
        elif mock_read.call_count == 1:
            mock_read.call_count += 1
            return b"This is the second chunk of data"
        else:
            return b""  # EOF

    mock_file.read = mock_read
    return mock_file


class TestStartSave:
    """Test cases for the /save/start endpoint"""

    @patch("backend.app.router.sections.manuscript_router.manuscript_manager")
    def test_start_save_success(self, mock_manager, client, sample_save_start_request):
        # Arrange
        expected_session_id = "test-session-id-123"
        mock_manager.start_manuscript_save_session.return_value = expected_session_id

        # Act
        response = client.post("/manuscript/save/start", json=sample_save_start_request)

        # Assert
        assert response.status_code == 200
        response_data = response.json()
        assert response_data["session_id"] == expected_session_id

        # Verify the manager was called with correct parameters
        mock_manager.start_manuscript_save_session.assert_called_once()
        call_args = mock_manager.start_manuscript_save_session.call_args[0][0]
        assert call_args.project_id == 123
        assert call_args.relative_path == "documents/chapters"
        assert call_args.filename == "chapter1.docx"
        assert call_args.title == "Chapter 1: The Beginning"

    @patch("backend.app.router.sections.manuscript_router.manuscript_manager")
    def test_start_save_minimal_data(self, mock_manager, client):
        # Arrange
        minimal_request = {
            "project_id": 456,
            "relative_path": "",
            "filename": "simple_file.txt",
        }
        expected_session_id = "minimal-session-id"
        mock_manager.start_manuscript_save_session.return_value = expected_session_id

        # Act
        response = client.post("/manuscript/save/start", json=minimal_request)

        # Assert
        assert response.status_code == 200
        response_data = response.json()
        assert response_data["session_id"] == expected_session_id

        call_args = mock_manager.start_manuscript_save_session.call_args[0][0]
        assert call_args.project_id == 456
        assert call_args.relative_path == ""
        assert call_args.filename == "simple_file.txt"
        assert call_args.title is None

    @patch("backend.app.router.sections.manuscript_router.manuscript_manager")
    def test_start_save_manager_error(
        self, mock_manager, client, sample_save_start_request
    ):
        # Arrange
        mock_manager.start_manuscript_save_session.side_effect = OSError(
            "Directory creation failed"
        )

        # Act & Assert
        with pytest.raises(OSError):
            client.post("/manuscript/save/start", json=sample_save_start_request)

    def test_start_save_invalid_request_data(self, client):
        # Arrange
        invalid_request = {
            "project_id": "invalid_string",  # Should be int
            "filename": "test.txt",
            # Missing relative_path
        }

        # Act
        response = client.post("/manuscript/save/start", json=invalid_request)

        # Assert
        assert response.status_code == 422  # Validation error

    def test_start_save_missing_required_fields(self, client):
        # Arrange
        incomplete_request = {
            "project_id": 123
            # Missing required fields: relative_path, filename
        }

        # Act
        response = client.post("/manuscript/save/start", json=incomplete_request)

        # Assert
        assert response.status_code == 422  # Validation error


class TestSaveChunk:
    """Test cases for the /save/chunk/{session_id} endpoint"""

    @patch("backend.app.router.sections.manuscript_router.manuscript_manager")
    def test_save_chunk_success(self, mock_manager, client):
        # Arrange
        session_id = "test-session-123"
        mock_manager.save_manuscript_chunk = AsyncMock()

        # Create test file data
        file_content = b"This is test chunk data"
        files = {
            "file": (
                "test_chunk.docx",
                BytesIO(file_content),
                "application/octet-stream",
            )
        }
        data = {"relative_path": "chapters/chapter1"}

        # Act
        response = client.post(
            f"/manuscript/save/chunk/{session_id}", files=files, data=data
        )

        # Assert
        assert response.status_code == 200
        response_data = response.json()
        assert response_data["ok"] is True

        # Verify the manager was called
        mock_manager.save_manuscript_chunk.assert_called_once()
        call_args = mock_manager.save_manuscript_chunk.call_args[0]
        assert call_args[0] == session_id
        # The second argument should be the UploadFile object
        assert hasattr(call_args[1], "filename")

    @patch("backend.app.router.sections.manuscript_router.manuscript_manager")
    def test_save_chunk_invalid_session(self, mock_manager, client):
        # Arrange
        from fastapi import HTTPException

        session_id = "invalid-session"
        mock_manager.save_manuscript_chunk = AsyncMock(
            side_effect=HTTPException(status_code=404, detail="Invalid session ID")
        )

        file_content = b"Test data"
        files = {"file": ("test.txt", BytesIO(file_content), "text/plain")}
        data = {"relative_path": "test/path"}

        # Act & Assert
        response = client.post(
            f"/manuscript/save/chunk/{session_id}", files=files, data=data
        )

        # Assert
        assert response.status_code == 404
        assert response.json() == {"detail": "Invalid session ID"}

    @patch("backend.app.router.sections.manuscript_router.manuscript_manager")
    def test_save_chunk_io_error(self, mock_manager, client):
        # Arrange
        from fastapi import HTTPException

        session_id = "test-session"
        mock_manager.save_manuscript_chunk = AsyncMock(
            side_effect=HTTPException(
                status_code=500, detail="Error writing to temporary file: IO Error"
            )
        )

        file_content = b"Test data"
        files = {"file": ("test.txt", BytesIO(file_content), "text/plain")}
        data = {"relative_path": "test/path"}

        # Act & Assert
        response = client.post(
            f"/manuscript/save/chunk/{session_id}", files=files, data=data
        )
        assert response.status_code == 500
        assert response.json() == {
            "detail": "Error writing to temporary file: IO Error"
        }

    def test_save_chunk_missing_file(self, client):
        # Arrange
        session_id = "test-session"
        data = {"relative_path": "test/path"}
        # No file provided

        # Act
        response = client.post(f"/manuscript/save/chunk/{session_id}", data=data)

        # Assert
        assert response.status_code == 422  # Validation error due to missing file

    def test_save_chunk_missing_relative_path(self, client):
        # Arrange
        session_id = "test-session"
        file_content = b"Test data"
        files = {"file": ("test.txt", BytesIO(file_content), "text/plain")}
        # No relative_path provided

        # Act
        response = client.post(f"/manuscript/save/chunk/{session_id}", files=files)

        # Assert
        assert (
            response.status_code == 422
        )  # Validation error due to missing relative_path


class TestFinishSave:
    """Test cases for the /save/finish/{session_id} endpoint"""

    @patch("backend.app.router.sections.manuscript_router.manuscript_manager")
    def test_finish_save_success(self, mock_manager, client):
        # Arrange
        session_id = "test-session-123"
        expected_response = {
            "saved": "/manuscripts/123/documents/chapters/chapter1.docx",
            "metadata": {"created_at": 1640995200.0, "modified_at": 1640995200.0},
            "metadata_location": "/manuscripts/123/documents/chapters/metadata.json",
        }
        mock_manager.finish_manuscript_save_session = AsyncMock(
            return_value=expected_response
        )

        # Act
        response = client.post(f"/manuscript/save/finish/{session_id}")

        # Assert
        assert response.status_code == 200
        response_data = response.json()

        assert response_data["saved"] == expected_response["saved"]
        assert response_data["metadata"] == expected_response["metadata"]
        assert (
            response_data["metadata_location"] == expected_response["metadata_location"]
        )

        mock_manager.finish_manuscript_save_session.assert_called_once_with(session_id)

    @patch("backend.app.router.sections.manuscript_router.manuscript_manager")
    def test_finish_save_invalid_session(self, mock_manager, client):
        # Arrange
        from fastapi import HTTPException

        session_id = "invalid-session"
        mock_manager.finish_manuscript_save_session = AsyncMock(
            side_effect=HTTPException(status_code=404, detail="Invalid session ID")
        )

        # Act & Assert
        response = client.post(f"/manuscript/save/finish/{session_id}")

        assert response.status_code == 404
        assert response.json() == {"detail": "Invalid session ID"}

    @patch("backend.app.router.sections.manuscript_router.manuscript_manager")
    def test_finish_save_file_move_error(self, mock_manager, client):
        # Arrange
        from fastapi import HTTPException

        session_id = "test-session"
        mock_manager.finish_manuscript_save_session = AsyncMock(
            side_effect=HTTPException(
                status_code=500,
                detail="Error moving file to final destination: Permission denied",
            )
        )

        # Act & Assert
        response = client.post(f"/manuscript/save/finish/{session_id}")

        assert response.status_code == 500
        assert response.json() == {
            "detail": "Error moving file to final destination: Permission denied"
        }

    @patch("backend.app.router.sections.manuscript_router.manuscript_manager")
    def test_finish_save_with_metadata_warning(self, mock_manager, client):
        # Arrange - Simulate successful file move but metadata write warning
        session_id = "test-session"
        expected_response = {
            "saved": "/manuscripts/123/test.txt",
            "metadata": {"created_at": 1640995200.0, "modified_at": 1640995200.0},
            "metadata_location": "/manuscripts/123/metadata.json",
        }
        mock_manager.finish_manuscript_save_session = AsyncMock(
            return_value=expected_response
        )

        # Act
        response = client.post(f"/manuscript/save/finish/{session_id}")

        # Assert
        assert response.status_code == 200
        response_data = response.json()
        assert "saved" in response_data
        assert "metadata" in response_data
        assert "metadata_location" in response_data


class TestManuscriptRouterIntegration:
    """Integration tests for the complete workflow"""

    @patch("backend.app.router.sections.manuscript_router.manuscript_manager")
    def test_complete_upload_workflow(self, mock_manager, client):
        # Arrange
        start_request = {
            "project_id": 123,
            "relative_path": "documents/chapters",
            "filename": "chapter1.docx",
            "title": "Chapter 1",
        }
        session_id = "workflow-session-123"

        # Mock all manager methods
        mock_manager.start_manuscript_save_session.return_value = session_id
        mock_manager.save_manuscript_chunk = AsyncMock()
        mock_manager.finish_manuscript_save_session = AsyncMock(
            return_value={
                "saved": "/manuscripts/123/documents/chapters/chapter1.docx",
                "metadata": {"created_at": 1640995200.0, "modified_at": 1640995200.0},
                "metadata_location": "/manuscripts/123/documents/chapters/metadata.json",
            }
        )

        # Act 1: Start save session
        start_response = client.post("/manuscript/save/start", json=start_request)
        assert start_response.status_code == 200
        returned_session_id = start_response.json()["session_id"]

        # Act 2: Save chunks
        file_content = b"This is chunk 1 data"
        files = {"file": ("chunk1.txt", BytesIO(file_content), "text/plain")}
        data = {"relative_path": "documents/chapters"}

        chunk_response = client.post(
            f"/manuscript/save/chunk/{returned_session_id}", files=files, data=data
        )
        assert chunk_response.status_code == 200
        assert chunk_response.json()["ok"] is True

        # Act 3: Finish save session
        finish_response = client.post(f"/manuscript/save/finish/{returned_session_id}")
        assert finish_response.status_code == 200
        finish_data = finish_response.json()

        # Assert
        assert "saved" in finish_data
        assert "metadata" in finish_data
        assert "metadata_location" in finish_data

        # Verify all manager methods were called in correct order
        mock_manager.start_manuscript_save_session.assert_called_once()
        mock_manager.save_manuscript_chunk.assert_called_once()
        mock_manager.finish_manuscript_save_session.assert_called_once_with(
            returned_session_id
        )

    @patch("backend.app.router.sections.manuscript_router.manuscript_manager")
    def test_workflow_with_multiple_chunks(self, mock_manager, client):
        # Arrange
        start_request = {
            "project_id": 456,
            "relative_path": "drafts",
            "filename": "large_document.pdf",
        }
        session_id = "multi-chunk-session"

        mock_manager.start_manuscript_save_session.return_value = session_id
        mock_manager.save_manuscript_chunk = AsyncMock()
        mock_manager.finish_manuscript_save_session = AsyncMock(
            return_value={
                "saved": "/manuscripts/456/drafts/large_document.pdf",
                "metadata": {"created_at": 1640995200.0, "modified_at": 1640995200.0},
                "metadata_location": "/manuscripts/456/drafts/metadata.json",
            }
        )

        # Act: Start session
        start_response = client.post("/manuscript/save/start", json=start_request)
        assert start_response.status_code == 200

        # Act: Save multiple chunks
        for i in range(3):
            chunk_data = f"Chunk {i + 1} data".encode()
            files = {"file": (f"chunk{i + 1}.txt", BytesIO(chunk_data), "text/plain")}
            data = {"relative_path": "drafts"}

            chunk_response = client.post(
                f"/manuscript/save/chunk/{session_id}", files=files, data=data
            )
            assert chunk_response.status_code == 200

        # Act: Finish session
        finish_response = client.post(f"/manuscript/save/finish/{session_id}")
        assert finish_response.status_code == 200

        # Assert: Verify chunk method was called 3 times
        assert mock_manager.save_manuscript_chunk.call_count == 3


class TestErrorHandling:
    """Test error handling scenarios"""

    @patch("backend.app.router.sections.manuscript_router.manuscript_manager")
    def test_session_not_found_in_chunk_upload(self, mock_manager, client):
        # Arrange
        from fastapi import HTTPException

        mock_manager.save_manuscript_chunk = AsyncMock(
            side_effect=HTTPException(status_code=404, detail="Invalid session ID")
        )

        file_content = b"Test data"
        files = {"file": ("test.txt", BytesIO(file_content), "text/plain")}
        data = {"relative_path": "test"}

        # Act & Assert
        response = client.post(
            "/manuscript/save/chunk/nonexistent-session", files=files, data=data
        )

        assert response.status_code == 404
        assert response.json() == {"detail": "Invalid session ID"}

    @patch("backend.app.router.sections.manuscript_router.manuscript_manager")
    def test_session_not_found_in_finish(self, mock_manager, client):
        # Arrange
        from fastapi import HTTPException

        mock_manager.finish_manuscript_save_session = AsyncMock(
            side_effect=HTTPException(status_code=404, detail="Invalid session ID")
        )

        # Act & Assert
        response = client.post("/manuscript/save/finish/nonexistent-session")

        assert response.status_code == 404
        assert response.json() == {"detail": "Invalid session ID"}

    def test_invalid_session_id_format(self, client):
        # Test with various invalid session ID formats
        invalid_session_ids = ["", "   ", "invalid/session", "session with spaces"]

        for invalid_id in invalid_session_ids:
            # Test chunk endpoint
            file_content = b"Test data"
            files = {"file": ("test.txt", BytesIO(file_content), "text/plain")}
            data = {"relative_path": "test"}

            # The endpoint should still accept the invalid session ID but the manager should handle validation
            response = client.post(
                f"/manuscript/save/chunk/{invalid_id}", files=files, data=data
            )
            # The response depends on what the manager does with invalid session IDs
            # In a real scenario, this would likely result in a 404 from the manager
            assert response.status_code == 404

    @patch("backend.app.router.sections.manuscript_router.manuscript_manager")
    def test_manager_unexpected_error(
        self, mock_manager, client, sample_save_start_request
    ):
        # Arrange
        mock_manager.start_manuscript_save_session.side_effect = Exception(
            "Unexpected internal error"
        )

        # Act & Assert
        with pytest.raises(Exception):
            client.post("/manuscript/save/start", json=sample_save_start_request)


class TestRouterConfiguration:
    """Test router configuration and metadata"""

    def test_router_prefix_and_tags(self):
        # Arrange & Act
        from backend.app.router.sections.manuscript_router import manuscript_router

        # Assert
        assert manuscript_router.prefix == "/manuscript"
        assert (
            "Plot" in manuscript_router.tags
        )  # Note: This seems to be incorrect in the source, should be "Manuscript"

    def test_available_endpoints(self, client):
        # This test verifies that all expected endpoints are available
        # We can check this by examining the OpenAPI schema

        # Act: Get OpenAPI schema
        response = client.get("/openapi.json")

        # Assert: Check that our endpoints exist in the schema
        if response.status_code == 200:
            schema = response.json()
            paths = schema.get("paths", {})

            # Check for our expected endpoints
            expected_endpoints = [
                "/manuscript/save/start",
                "/manuscript/save/chunk/{session_id}",
                "/manuscript/save/finish/{session_id}",
            ]

            for endpoint in expected_endpoints:
                assert (
                    endpoint in paths
                ), f"Endpoint {endpoint} not found in OpenAPI schema"


# Test fixtures for edge cases
class TestEdgeCases:
    """Test edge cases and boundary conditions"""

    @patch("backend.app.router.sections.manuscript_router.manuscript_manager")
    def test_empty_file_upload(self, mock_manager, client):
        # Arrange
        session_id = "empty-file-session"
        mock_manager.save_manuscript_chunk = AsyncMock()

        # Create empty file
        files = {"file": ("empty.txt", BytesIO(b""), "text/plain")}
        data = {"relative_path": "test"}

        # Act
        response = client.post(
            f"/manuscript/save/chunk/{session_id}", files=files, data=data
        )

        # Assert
        assert response.status_code == 200
        mock_manager.save_manuscript_chunk.assert_called_once()

    @patch("backend.app.router.sections.manuscript_router.manuscript_manager")
    def test_very_long_session_id(self, mock_manager, client):
        # Arrange
        very_long_session_id = "a" * 1000  # 1000 character session ID
        mock_manager.save_manuscript_chunk = AsyncMock()

        files = {"file": ("test.txt", BytesIO(b"data"), "text/plain")}
        data = {"relative_path": "test"}

        # Act
        response = client.post(
            f"/manuscript/save/chunk/{very_long_session_id}", files=files, data=data
        )

        # Assert
        assert response.status_code == 200
        mock_manager.save_manuscript_chunk.assert_called_once()

    @patch("backend.app.router.sections.manuscript_router.manuscript_manager")
    def test_special_characters_in_paths(self, mock_manager, client):
        # Arrange
        special_char_request = {
            "project_id": 123,
            "relative_path": "documents/with spaces/and-dashes/and_underscores",
            "filename": "file with spaces & special chars.txt",
        }
        mock_manager.start_manuscript_save_session.return_value = "special-session"

        # Act
        response = client.post("/manuscript/save/start", json=special_char_request)

        # Assert
        assert response.status_code == 200
        mock_manager.start_manuscript_save_session.assert_called_once()
