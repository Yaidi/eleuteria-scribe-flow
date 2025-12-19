import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi.testclient import TestClient
from fastapi import UploadFile
from fastapi import HTTPException
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
            "Manuscript API" in manuscript_router.tags
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


class TestDeleteFile:
    """Test cases for the DELETE /manuscript/ endpoint"""

    @patch("backend.app.router.sections.manuscript_router.manuscript_manager")
    def test_delete_file_success(self, mock_manager, client):
        # Arrange
        mock_manager.delete_path = AsyncMock()
        request_data = {"project_id": 123, "path": "docs/file.txt"}

        # Act
        response = client.request("DELETE", "/manuscript/", json=request_data)

        # Assert
        assert response.status_code == 200
        response_data = response.json()
        assert response_data["path"] == "docs/file.txt"

        mock_manager.delete_path.assert_awaited_once_with(123, "docs/file.txt")

    @patch("backend.app.router.sections.manuscript_router.manuscript_manager")
    def test_delete_file_not_found(self, mock_manager, client):
        # Arrange
        from fastapi import HTTPException

        mock_manager.delete_path = AsyncMock(
            side_effect=HTTPException(status_code=404, detail="File not found")
        )
        request_data = {"project_id": 123, "path": "missing.txt"}

        # Act
        response = client.request("DELETE", "/manuscript/", json=request_data)

        # Assert
        assert response.status_code == 404
        assert response.json() == {"detail": "File not found"}

    @patch("backend.app.router.sections.manuscript_router.manuscript_manager")
    def test_delete_file_permission_denied(self, mock_manager, client):
        # Arrange
        from fastapi import HTTPException

        mock_manager.delete_path = AsyncMock(
            side_effect=HTTPException(status_code=403, detail="Permission denied")
        )
        request_data = {"project_id": 123, "path": "secure/file.txt"}

        # Act
        response = client.request("DELETE", "/manuscript/", json=request_data)

        # Assert
        assert response.status_code == 403
        assert response.json() == {"detail": "Permission denied"}

    def test_delete_file_invalid_request(self, client):
        # Arrange
        invalid_request = {"project_id": "invalid", "wrong_field": "docs/file.txt"}

        # Act
        response = client.request("DELETE", "/manuscript/", json=invalid_request)

        # Assert
        assert response.status_code == 422  # Validation error

    def test_delete_file_missing_required_fields(self, client):
        # Arrange
        incomplete_request = {"project_id": 123}  # Falta "path"

        # Act
        response = client.request("DELETE", "/manuscript/", json=incomplete_request)

        # Assert
        assert response.status_code == 422


class TestGetFileContentEndpoint:
    """Tests for POST /manuscript/content endpoint"""

    @patch("backend.app.router.sections.manuscript_router.manuscript_manager")
    def test_get_file_content_success(self, mock_manager, client):
        """Test successful file content retrieval"""
        # Arrange
        expected_content = (
            "This is the content of the manuscript file\nWith multiple lines"
        )
        mock_manager.get_manuscript_file_content = AsyncMock(
            return_value=expected_content
        )

        request_data = {"project_id": 1, "path": "docs/chapter1.md"}

        # Act
        response = client.post("/manuscript/content", json=request_data)

        # Assert
        assert response.status_code == 200
        response_data = response.json()
        assert response_data == {"content": expected_content}

        # Verify manager method was called with correct parameters
        mock_manager.get_manuscript_file_content.assert_called_once_with(
            1, "docs/chapter1.md"
        )

    @patch("backend.app.router.sections.manuscript_router.manuscript_manager")
    def test_get_file_content_empty_file(self, mock_manager, client):
        """Test retrieving empty file content"""
        # Arrange
        mock_manager.get_manuscript_file_content = AsyncMock(return_value="")

        request_data = {"project_id": 2, "path": "empty.txt"}

        # Act
        response = client.post("/manuscript/content", json=request_data)

        # Assert
        assert response.status_code == 200
        response_data = response.json()
        assert response_data == {"content": ""}
        mock_manager.get_manuscript_file_content.assert_called_once_with(2, "empty.txt")

    @patch("backend.app.router.sections.manuscript_router.manuscript_manager")
    def test_get_file_content_large_file(self, mock_manager, client):
        """Test retrieving large manuscript file"""
        # Arrange
        large_content = "word " * 20000  # ~20k words
        mock_manager.get_manuscript_file_content = AsyncMock(return_value=large_content)

        request_data = {"project_id": 3, "path": "manuscripts/large_novel.txt"}

        # Act
        response = client.post("/manuscript/content", json=request_data)

        # Assert
        assert response.status_code == 200
        response_data = response.json()
        assert response_data == {"content": large_content}
        assert len(response_data["content"].split()) == 20000
        mock_manager.get_manuscript_file_content.assert_called_once_with(
            3, "manuscripts/large_novel.txt"
        )

    @patch("backend.app.router.sections.manuscript_router.manuscript_manager")
    def test_get_file_content_nested_path(self, mock_manager, client):
        """Test deeply nested file path"""
        # Arrange
        expected_content = "Deeply nested file content"
        mock_manager.get_manuscript_file_content = AsyncMock(
            return_value=expected_content
        )

        request_data = {"project_id": 6, "path": "level1/level2/level3/deep_file.txt"}

        # Act
        response = client.post("/manuscript/content", json=request_data)

        # Assert
        assert response.status_code == 200
        response_data = response.json()
        assert response_data == {"content": expected_content}
        mock_manager.get_manuscript_file_content.assert_called_once_with(
            6, "level1/level2/level3/deep_file.txt"
        )

    @patch("backend.app.router.sections.manuscript_router.manuscript_manager")
    def test_get_file_content_file_not_found(self, mock_manager, client):
        """Test file not found error (404)"""
        # Arrange
        mock_manager.get_manuscript_file_content = AsyncMock(
            side_effect=HTTPException(
                status_code=404, detail="File not found: nonexistent/file.txt"
            )
        )

        request_data = {"project_id": 7, "path": "nonexistent/file.txt"}

        # Act
        response = client.post("/manuscript/content", json=request_data)

        # Assert
        assert response.status_code == 404
        response_data = response.json()
        assert response_data["detail"] == "File not found: nonexistent/file.txt"
        mock_manager.get_manuscript_file_content.assert_called_once_with(
            7, "nonexistent/file.txt"
        )

    @patch("backend.app.router.sections.manuscript_router.manuscript_manager")
    def test_get_file_content_path_is_directory(self, mock_manager, client):
        """Test error when path points to directory (404)"""
        # Arrange
        mock_manager.get_manuscript_file_content = AsyncMock(
            side_effect=HTTPException(
                status_code=404, detail="Path is not a file: docs"
            )
        )

        request_data = {"project_id": 8, "path": "docs"}

        # Act
        response = client.post("/manuscript/content", json=request_data)

        # Assert
        assert response.status_code == 404
        response_data = response.json()
        assert response_data["detail"] == "Path is not a file: docs"
        mock_manager.get_manuscript_file_content.assert_called_once_with(8, "docs")

    @patch("backend.app.router.sections.manuscript_router.manuscript_manager")
    def test_get_file_content_permission_error(self, mock_manager, client):
        """Test permission error (403)"""
        # Arrange
        mock_manager.get_manuscript_file_content = AsyncMock(
            side_effect=HTTPException(
                status_code=403,
                detail="Insufficient permission to read: protected/file.txt",
            )
        )

        request_data = {"project_id": 9, "path": "protected/file.txt"}

        # Act
        response = client.post("/manuscript/content", json=request_data)

        # Assert
        assert response.status_code == 403
        response_data = response.json()
        assert (
            response_data["detail"]
            == "Insufficient permission to read: protected/file.txt"
        )
        mock_manager.get_manuscript_file_content.assert_called_once_with(
            9, "protected/file.txt"
        )

    @patch("backend.app.router.sections.manuscript_router.manuscript_manager")
    def test_get_file_content_binary_file_error(self, mock_manager, client):
        """Test binary file error (500)"""
        # Arrange
        mock_manager.get_manuscript_file_content = AsyncMock(
            side_effect=HTTPException(
                status_code=500, detail="File is not a valid text file: binary_file.exe"
            )
        )

        request_data = {"project_id": 10, "path": "binary_file.exe"}

        # Act
        response = client.post("/manuscript/content", json=request_data)

        # Assert
        assert response.status_code == 500
        response_data = response.json()
        assert (
            response_data["detail"] == "File is not a valid text file: binary_file.exe"
        )
        mock_manager.get_manuscript_file_content.assert_called_once_with(
            10, "binary_file.exe"
        )

    @patch("backend.app.router.sections.manuscript_router.manuscript_manager")
    def test_get_file_content_os_error(self, mock_manager, client):
        """Test OS error (500)"""
        # Arrange
        mock_manager.get_manuscript_file_content = AsyncMock(
            side_effect=HTTPException(
                status_code=500,
                detail="Error reading file docs/file.txt: Disk I/O error",
            )
        )

        request_data = {"project_id": 11, "path": "docs/file.txt"}

        # Act
        response = client.post("/manuscript/content", json=request_data)

        # Assert
        assert response.status_code == 500
        response_data = response.json()
        assert (
            response_data["detail"]
            == "Error reading file docs/file.txt: Disk I/O error"
        )
        mock_manager.get_manuscript_file_content.assert_called_once_with(
            11, "docs/file.txt"
        )

    def test_get_file_content_missing_project_id(self, client):
        """Test request with missing project_id field"""
        # Arrange
        request_data = {
            "path": "docs/file.txt"
            # Missing project_id
        }

        # Act
        response = client.post("/manuscript/content", json=request_data)

        # Assert
        assert response.status_code == 422  # Validation error
        response_data = response.json()
        assert "detail" in response_data
        # Check that validation error mentions missing field
        assert any("project_id" in str(error) for error in response_data["detail"])

    def test_get_file_content_missing_path(self, client):
        """Test request with missing path field"""
        # Arrange
        request_data = {
            "project_id": 12
            # Missing path
        }

        # Act
        response = client.post("/manuscript/content", json=request_data)

        # Assert
        assert response.status_code == 422  # Validation error
        response_data = response.json()
        assert "detail" in response_data
        # Check that validation error mentions missing field
        assert any("path" in str(error) for error in response_data["detail"])

    def test_get_file_content_invalid_project_id_type(self, client):
        """Test request with invalid project_id type"""
        # Arrange
        request_data = {"project_id": "not_an_integer", "path": "docs/file.txt"}

        # Act
        response = client.post("/manuscript/content", json=request_data)

        # Assert
        assert response.status_code == 422  # Validation error
        response_data = response.json()
        assert "detail" in response_data

    def test_get_file_content_invalid_path_type(self, client):
        """Test request with invalid path type"""
        # Arrange
        request_data = {"project_id": 13, "path": 123}  # Should be string

        # Act
        response = client.post("/manuscript/content", json=request_data)

        # Assert
        assert response.status_code == 422  # Validation error
        response_data = response.json()
        assert "detail" in response_data

    def test_get_file_content_empty_request_body(self, client):
        """Test request with empty body"""
        # Act
        response = client.post("/manuscript/content", json={})

        # Assert
        assert response.status_code == 422  # Validation error
        response_data = response.json()
        assert "detail" in response_data

    def test_get_file_content_no_json_body(self, client):
        """Test request without JSON body"""
        # Act
        response = client.post("/manuscript/content")

        # Assert
        assert response.status_code == 422  # Validation error

    @patch("backend.app.router.sections.manuscript_router.manuscript_manager")
    def test_get_file_content_zero_project_id(self, mock_manager, client):
        """Test with project_id = 0"""
        # Arrange
        expected_content = "Content from project zero"
        mock_manager.get_manuscript_file_content = AsyncMock(
            return_value=expected_content
        )

        request_data = {"project_id": 0, "path": "file.txt"}

        # Act
        response = client.post("/manuscript/content", json=request_data)

        # Assert
        assert response.status_code == 200
        response_data = response.json()
        assert response_data == {"content": expected_content}
        mock_manager.get_manuscript_file_content.assert_called_once_with(0, "file.txt")

    @patch("backend.app.router.sections.manuscript_router.manuscript_manager")
    def test_get_file_content_empty_path_string(self, mock_manager, client):
        """Test with empty path string"""
        # Arrange
        expected_content = "Content from empty path"
        mock_manager.get_manuscript_file_content = AsyncMock(
            return_value=expected_content
        )

        request_data = {"project_id": 14, "path": ""}

        # Act
        response = client.post("/manuscript/content", json=request_data)

        # Assert
        assert response.status_code == 200
        response_data = response.json()
        assert response_data == {"content": expected_content}
        mock_manager.get_manuscript_file_content.assert_called_once_with(14, "")
