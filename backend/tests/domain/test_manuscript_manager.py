import os
import json
import tempfile
from unittest.mock import patch

import pytest
from io import BytesIO
from fastapi import UploadFile, HTTPException

import pytest_asyncio

from backend.app.domain.manuscript_manager import ManuscriptManager
from backend.app.schemas.sections.manuscript_schemas import SaveStartRequest


@pytest_asyncio.fixture
async def manager(tmp_path, monkeypatch):
    monkeypatch.setattr(ManuscriptManager, "ROOT_DIR", str(tmp_path))
    os.makedirs(ManuscriptManager.ROOT_DIR, exist_ok=True)
    m = ManuscriptManager()
    yield m
    m.sessions.clear()


def make_upload_file(content: bytes, filename="chunk.txt"):
    return UploadFile(file=BytesIO(content), filename=filename)


def test_start_manuscript_save_session_creates_session(manager):
    req = SaveStartRequest(project_id=1, relative_path="docs", filename="file.txt")
    session_id = manager.start_manuscript_save_session(req)

    assert session_id in manager.sessions
    data = manager.sessions[session_id]
    assert data["filename"] == "file.txt"
    assert os.path.basename(data["temp_path"]).startswith("file.txt.")


@pytest.mark.asyncio
async def test_save_chunk_and_finish(manager):
    req = SaveStartRequest(project_id=1, relative_path="docs", filename="file.txt")
    session_id = manager.start_manuscript_save_session(req)

    upload = make_upload_file(b"Hello world")
    await manager.save_manuscript_chunk(session_id, upload)

    result = await manager.finish_manuscript_save_session(session_id)

    # El archivo final debe existir
    assert os.path.exists(result["saved"])
    with open(result["saved"], "rb") as f:
        assert f.read() == b"Hello world"

    # metadata.json debe existir
    assert os.path.exists(result["metadata_location"])
    with open(result["metadata_location"], "r") as f:
        metadata = json.load(f)
    assert "docs" in metadata


@pytest.mark.asyncio
async def test_save_chunk_invalid_session(manager):
    upload = make_upload_file(b"data")
    with pytest.raises(HTTPException) as e:
        await manager.save_manuscript_chunk("invalid-id", upload)
    assert e.value.status_code == 404


@pytest.mark.asyncio
async def test_finish_invalid_session(manager):
    with pytest.raises(HTTPException) as e:
        await manager.finish_manuscript_save_session("invalid-id")
    assert e.value.status_code == 404


@pytest.mark.asyncio
async def test_update_metadata_existing_file(manager):
    # Crear sesión y archivo final
    req = SaveStartRequest(project_id=1, relative_path="docs", filename="file.txt")
    session_id = manager.start_manuscript_save_session(req)
    data = manager.sessions[session_id]
    final_path = os.path.join(
        data["project_path"], data["relative_path"], data["filename"]
    )
    os.makedirs(os.path.dirname(final_path), exist_ok=True)
    with open(final_path, "wb") as f:
        f.write(b"123")

    # Crear metadata.json corrupto
    metadata_path = os.path.join(
        data["project_path"], data["relative_path"], "metadata.json"
    )
    with open(metadata_path, "w") as f:
        f.write("{not valid json}")

    result = await manager._update_file_metadata(data, final_path)

    assert os.path.exists(result["metadata_path"])
    assert "created_at" in result["metadata"]


@pytest.mark.asyncio
async def test_move_temp_file_failure(manager, monkeypatch):
    # Preparar datos falsos
    temp_file = tempfile.NamedTemporaryFile(delete=False)
    temp_file.write(b"abc")
    temp_file.close()

    data = {
        "project_path": tempfile.mkdtemp(),
        "relative_path": ".",
        "filename": "file.txt",
        "temp_path": temp_file.name,
    }

    # Forzar error en shutil.move
    def fake_move(src, dst):
        raise OSError("cannot move")

    monkeypatch.setattr("backend.app.domain.manuscript_manager.shutil.move", fake_move)

    with pytest.raises(HTTPException) as e:
        await ManuscriptManager._move_temp_file_to_final_destination(data)
    assert e.value.status_code == 500


class TestDeletePath:
    """Unit tests for ManuscriptManager.delete_path"""

    @pytest.mark.asyncio
    @patch("backend.app.domain.manuscript_manager.os.path.isfile")
    @patch("backend.app.domain.manuscript_manager.os.path.isdir")
    @patch("backend.app.domain.manuscript_manager.os.remove")
    async def test_delete_file_success(
        self, mock_remove, mock_isdir, mock_isfile, manager
    ):
        # Arrange
        mock_isfile.return_value = True
        mock_isdir.return_value = False

        # Act
        await manager.delete_path(123, "docs/file.txt")

        # Assert
        mock_remove.assert_called_once()
        mock_isdir.assert_not_called()

    @pytest.mark.asyncio
    @patch("backend.app.domain.manuscript_manager.os.path.isfile")
    @patch("backend.app.domain.manuscript_manager.os.path.isdir")
    @patch("backend.app.domain.manuscript_manager.shutil.rmtree")
    async def test_delete_directory_success(
        self, mock_rmtree, mock_isdir, mock_isfile, manager
    ):
        # Arrange
        mock_isfile.return_value = False
        mock_isdir.return_value = True

        # Act
        await manager.delete_path(123, "docs/folder")

        # Assert
        mock_rmtree.assert_called_once()

    @pytest.mark.asyncio
    @patch("backend.app.domain.manuscript_manager.os.path.isfile")
    @patch("backend.app.domain.manuscript_manager.os.path.isdir")
    async def test_delete_path_not_found(self, mock_isdir, mock_isfile, manager):
        # Arrange
        mock_isfile.return_value = False
        mock_isdir.return_value = False

        # Act & Assert
        with pytest.raises(HTTPException) as exc:
            await manager.delete_path(123, "nonexistent/path")
        assert exc.value.status_code == 404
        assert "File or Path not found" in exc.value.detail

    @pytest.mark.asyncio
    @patch("backend.app.domain.manuscript_manager.os.path.isfile")
    @patch("backend.app.domain.manuscript_manager.os.path.isdir")
    @patch("backend.app.domain.manuscript_manager.os.remove")
    async def test_delete_file_permission_denied(
        self, mock_remove, mock_isdir, mock_isfile, manager
    ):
        # Arrange
        mock_isfile.return_value = True
        mock_isdir.return_value = False
        mock_remove.side_effect = PermissionError()

        # Act & Assert
        with pytest.raises(HTTPException) as exc:
            await manager.delete_path(123, "secure/file.txt")
        assert exc.value.status_code == 403
        assert "Insufficient permission" in exc.value.detail

    @pytest.mark.asyncio
    @patch("backend.app.domain.manuscript_manager.os.path.isfile")
    @patch("backend.app.domain.manuscript_manager.os.path.isdir")
    @patch("backend.app.domain.manuscript_manager.os.remove")
    async def test_delete_file_os_error(
        self, mock_remove, mock_isdir, mock_isfile, manager
    ):
        # Arrange
        mock_isfile.return_value = True
        mock_isdir.return_value = False
        mock_remove.side_effect = OSError("Generic OS error")

        # Act & Assert
        with pytest.raises(HTTPException) as exc:
            await manager.delete_path(123, "docs/file.txt")
        assert exc.value.status_code == 500
        assert "Error deleting" in exc.value.detail

    @pytest.mark.asyncio
    @patch("backend.app.domain.manuscript_manager.os.path.isfile")
    @patch("backend.app.domain.manuscript_manager.os.path.isdir")
    @patch("backend.app.domain.manuscript_manager.shutil.rmtree")
    async def test_delete_directory_os_error(
        self, mock_rmtree, mock_isdir, mock_isfile, manager
    ):
        # Arrange
        mock_isfile.return_value = False
        mock_isdir.return_value = True
        mock_rmtree.side_effect = OSError("Generic OS error")

        # Act & Assert
        with pytest.raises(HTTPException) as exc:
            await manager.delete_path(123, "docs/folder")
        assert exc.value.status_code == 500
        assert "Error deleting" in exc.value.detail
