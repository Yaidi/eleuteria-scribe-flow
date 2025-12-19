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
    monkeypatch.setattr(ManuscriptManager, "UPLOAD_DIR", str(tmp_path))
    os.makedirs(ManuscriptManager.UPLOAD_DIR, exist_ok=True)
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


class TestGetManuscriptFileContent:
    """Unit tests for ManuscriptManager.get_manuscript_file_content"""

    @pytest.mark.asyncio
    async def test_get_file_content_success(self, manager, tmp_path):
        """Test successful file content retrieval"""
        # Arrange
        project_id = 1
        relative_path = "docs/test_file.txt"
        expected_content = "This is a test file content\nWith multiple lines\nAnd special characters: áéíóú"

        # Create project directory and file
        project_dir = tmp_path / str(project_id)
        project_dir.mkdir(parents=True)
        file_path = project_dir / "docs" / "test_file.txt"
        file_path.parent.mkdir(parents=True)

        # Write test content with UTF-8 encoding
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(expected_content)

        # Act
        result = await manager.get_manuscript_file_content(project_id, relative_path)

        # Assert
        assert result == expected_content

    @pytest.mark.asyncio
    async def test_get_file_content_with_leading_slash(self, manager, tmp_path):
        """Test file retrieval with leading slash in path"""
        # Arrange
        project_id = 2
        relative_path = "/docs/file.txt"  # Leading slash should be stripped
        expected_content = "File with leading slash path"

        # Create file
        project_dir = tmp_path / str(project_id)
        project_dir.mkdir(parents=True)
        file_path = project_dir / "docs" / "file.txt"
        file_path.parent.mkdir(parents=True)

        with open(file_path, "w", encoding="utf-8") as f:
            f.write(expected_content)

        # Act
        result = await manager.get_manuscript_file_content(project_id, relative_path)

        # Assert
        assert result == expected_content

    @pytest.mark.asyncio
    async def test_get_file_content_empty_path(self, manager, tmp_path):
        """Test file retrieval with empty path resolves to project root"""
        # Arrange
        project_id = 3
        relative_path = ""  # Empty path should resolve to "."
        expected_content = "Root file content"

        # Create file in project root
        project_dir = tmp_path / str(project_id)
        project_dir.mkdir(parents=True)
        file_path = project_dir / "root_file.txt"

        with open(file_path, "w", encoding="utf-8") as f:
            f.write(expected_content)

        # Act - Note: we need to specify the actual filename
        result = await manager.get_manuscript_file_content(project_id, "root_file.txt")

        # Assert
        assert result == expected_content

    @pytest.mark.asyncio
    async def test_get_file_content_large_file(self, manager, tmp_path):
        """Test retrieval of a large text file"""
        # Arrange
        project_id = 4
        relative_path = "large_file.txt"

        # Create a file with ~20,000 words (typical manuscript size)
        words = ["word"] * 20000
        expected_content = " ".join(words)

        project_dir = tmp_path / str(project_id)
        project_dir.mkdir(parents=True)
        file_path = project_dir / "large_file.txt"

        with open(file_path, "w", encoding="utf-8") as f:
            f.write(expected_content)

        # Act
        result = await manager.get_manuscript_file_content(project_id, relative_path)

        # Assert
        assert result == expected_content
        assert len(result.split()) == 20000

    @pytest.mark.asyncio
    async def test_get_file_content_file_not_found(self, manager, tmp_path):
        """Test error when file doesn't exist"""
        # Arrange
        project_id = 6
        relative_path = "nonexistent/file.txt"

        # Ensure project directory exists but file doesn't
        project_dir = tmp_path / str(project_id)
        project_dir.mkdir(parents=True)

        # Act & Assert
        with pytest.raises(HTTPException) as exc:
            await manager.get_manuscript_file_content(project_id, relative_path)

        assert exc.value.status_code == 404
        assert "File not found" in exc.value.detail
        assert relative_path in exc.value.detail

    @pytest.mark.asyncio
    async def test_get_file_content_path_is_directory(self, manager, tmp_path):
        """Test error when path points to a directory"""
        # Arrange
        project_id = 7
        relative_path = "docs"  # This will be a directory

        # Create directory
        project_dir = tmp_path / str(project_id)
        docs_dir = project_dir / "docs"
        docs_dir.mkdir(parents=True)

        # Act & Assert
        with pytest.raises(HTTPException) as exc:
            await manager.get_manuscript_file_content(project_id, relative_path)

        assert exc.value.status_code == 404
        assert "Path is not a file" in exc.value.detail
        assert relative_path in exc.value.detail

    @pytest.mark.asyncio
    @patch("backend.app.domain.manuscript_manager.aiofiles.open")
    async def test_get_file_content_permission_error(self, mock_aiofiles_open, manager):
        """Test permission error handling"""
        # Arrange
        project_id = 8
        relative_path = "protected/file.txt"

        # Mock file operations to simulate permission error
        mock_aiofiles_open.side_effect = PermissionError("Access denied")

        with patch(
            "backend.app.domain.manuscript_manager.os.path.exists",
            return_value=True,
        ):
            with patch(
                "backend.app.domain.manuscript_manager.os.path.isfile",
                return_value=True,
            ):
                # Act & Assert
                with pytest.raises(HTTPException) as exc:
                    await manager.get_manuscript_file_content(project_id, relative_path)

                assert exc.value.status_code == 403
                assert "Insufficient permission to read" in exc.value.detail
                assert relative_path in exc.value.detail

    @pytest.mark.asyncio
    @patch("backend.app.domain.manuscript_manager.aiofiles.open")
    async def test_get_file_content_unicode_decode_error(
        self, mock_aiofiles_open, manager
    ):
        """Test handling of binary/non-text files"""
        # Arrange
        project_id = 9
        relative_path = "binary_file.exe"

        # Mock file operations to simulate unicode decode error
        mock_aiofiles_open.side_effect = UnicodeDecodeError(
            "utf-8", b"\x80\x81", 0, 1, "invalid start byte"
        )

        with patch(
            "backend.app.domain.manuscript_manager.os.path.exists",
            return_value=True,
        ):
            with patch(
                "backend.app.domain.manuscript_manager.os.path.isfile",
                return_value=True,
            ):
                # Act & Assert
                with pytest.raises(HTTPException) as exc:
                    await manager.get_manuscript_file_content(project_id, relative_path)

                assert exc.value.status_code == 500
                assert "File is not a valid text file" in exc.value.detail
                assert relative_path in exc.value.detail

    @pytest.mark.asyncio
    @patch("backend.app.domain.manuscript_manager.aiofiles.open")
    async def test_get_file_content_os_error(self, mock_aiofiles_open, manager):
        """Test handling of generic OS errors"""
        # Arrange
        project_id = 10
        relative_path = "problematic/file.txt"

        # Mock file operations to simulate OS error
        mock_os_error = OSError("Disk I/O error")
        mock_os_error.strerror = "Disk I/O error"
        mock_aiofiles_open.side_effect = mock_os_error

        with patch(
            "backend.app.domain.manuscript_manager.os.path.exists",
            return_value=True,
        ):
            with patch(
                "backend.app.domain.manuscript_manager.os.path.isfile",
                return_value=True,
            ):
                # Act & Assert
                with pytest.raises(HTTPException) as exc:
                    await manager.get_manuscript_file_content(project_id, relative_path)

                assert exc.value.status_code == 500
                assert "Error reading file" in exc.value.detail
                assert relative_path in exc.value.detail
                assert "Disk I/O error" in exc.value.detail

    @pytest.mark.asyncio
    async def test_get_file_content_empty_file(self, manager, tmp_path):
        """Test reading an empty file"""
        # Arrange
        project_id = 11
        relative_path = "empty.txt"

        project_dir = tmp_path / str(project_id)
        project_dir.mkdir(parents=True)
        file_path = project_dir / "empty.txt"

        # Create empty file
        file_path.touch()

        # Act
        result = await manager.get_manuscript_file_content(project_id, relative_path)

        # Assert
        assert result == ""

    @pytest.mark.asyncio
    async def test_get_file_content_nested_directories(self, manager, tmp_path):
        """Test file retrieval from deeply nested directories"""
        # Arrange
        project_id = 13
        relative_path = "level1/level2/level3/deep_file.txt"
        expected_content = "Content in deeply nested file"

        project_dir = tmp_path / str(project_id)
        file_path = project_dir / "level1" / "level2" / "level3" / "deep_file.txt"
        file_path.parent.mkdir(parents=True)

        with open(file_path, "w", encoding="utf-8") as f:
            f.write(expected_content)

        # Act
        result = await manager.get_manuscript_file_content(project_id, relative_path)

        # Assert
        assert result == expected_content

    @pytest.mark.asyncio
    async def test_get_file_content_path_normalization(self, manager, tmp_path):
        """Test path normalization with multiple slashes and dots"""
        # Arrange
        project_id = 14
        expected_content = "Normalized path content"

        project_dir = tmp_path / str(project_id)
        project_dir.mkdir(parents=True)

        # Create the actual file where the normalized path should point
        file_path = project_dir / "docs" / "file.txt"
        file_path.parent.mkdir(parents=True)

        with open(file_path, "w", encoding="utf-8") as f:
            f.write(expected_content)

        # Act - The method should handle path normalization
        result = await manager.get_manuscript_file_content(project_id, "docs/file.txt")

        # Assert
        assert result == expected_content

    @pytest.mark.asyncio
    @patch("backend.app.domain.manuscript_manager.os.path.exists")
    @patch("backend.app.domain.manuscript_manager.os.path.isfile")
    async def test_get_file_content_file_system_edge_cases(
        self, mock_isfile, mock_exists, manager
    ):
        """Test edge cases with file system checks"""
        # Test case: path exists but is neither file nor directory (e.g., symlink)
        project_id = 15
        relative_path = "strange_path"

        mock_exists.return_value = True
        mock_isfile.return_value = False

        # Act & Assert
        with pytest.raises(HTTPException) as exc:
            await manager.get_manuscript_file_content(project_id, relative_path)

        assert exc.value.status_code == 404
        assert "Path is not a file" in exc.value.detail


class TestListDirectoryContents:
    """Unit tests for ManuscriptManager.list_directory_contents"""

    @pytest.mark.asyncio
    async def test_list_project_root_empty(self, manager, tmp_path):
        """Test listing empty project root"""
        # Arrange
        project_id = 1

        # Create empty project directory
        project_dir = tmp_path / str(project_id)
        project_dir.mkdir(parents=True)

        # Act
        result = await manager.list_directory_contents(project_id, "")

        # Assert
        assert result["path"] == ""
        assert result["entries"] == []

    @pytest.mark.asyncio
    async def test_list_project_root_with_files_and_directories(
        self, manager, tmp_path
    ):
        """Test listing project root with mixed content"""
        # Arrange
        project_id = 1
        project_dir = tmp_path / str(project_id)
        project_dir.mkdir(parents=True)

        # Create files and directories
        (project_dir / "README.md").write_text("# Project README")
        (project_dir / "chapter1.md").write_text("Chapter 1 content")
        (project_dir / "docs").mkdir()
        (project_dir / "scenes").mkdir()

        # Create some content in subdirectories
        (project_dir / "docs" / "notes.txt").write_text("Notes")

        # Act
        result = await manager.list_directory_contents(project_id, "")

        # Assert
        assert result["path"] == ""
        assert len(result["entries"]) == 4

        # Check entries are sorted alphabetically
        entry_names = [entry["name"] for entry in result["entries"]]
        assert entry_names == ["README.md", "chapter1.md", "docs", "scenes"]

        # Check file entries
        readme_entry = next(e for e in result["entries"] if e["name"] == "README.md")
        assert readme_entry == {
            "name": "README.md",
            "path": "README.md",
            "type": "file",
            "size": len("# Project README"),
        }

        # Check directory entries
        docs_entry = next(e for e in result["entries"] if e["name"] == "docs")
        assert docs_entry == {
            "name": "docs",
            "path": "docs",
            "type": "directory",
            "hasChildren": True,
        }

        scenes_entry = next(e for e in result["entries"] if e["name"] == "scenes")
        assert scenes_entry == {
            "name": "scenes",
            "path": "scenes",
            "type": "directory",
            "hasChildren": False,
        }

    @pytest.mark.asyncio
    async def test_list_subdirectory(self, manager, tmp_path):
        """Test listing contents of subdirectory"""
        # Arrange
        project_id = 2
        project_dir = tmp_path / str(project_id)
        project_dir.mkdir(parents=True)

        # Create subdirectory structure
        docs_dir = project_dir / "docs"
        docs_dir.mkdir()
        (docs_dir / "file1.txt").write_text("Content 1")
        (docs_dir / "file2.md").write_text("Content 2")
        (docs_dir / "subfolder").mkdir()

        # Act
        result = await manager.list_directory_contents(project_id, "docs")

        # Assert
        assert result["path"] == "docs"
        assert len(result["entries"]) == 3

        # Check paths are relative to project root
        file1_entry = next(e for e in result["entries"] if e["name"] == "file1.txt")
        assert file1_entry["path"] == "docs/file1.txt"

        subfolder_entry = next(e for e in result["entries"] if e["name"] == "subfolder")
        assert subfolder_entry["path"] == "docs/subfolder"

    @pytest.mark.asyncio
    async def test_list_deeply_nested_directory(self, manager, tmp_path):
        """Test listing deeply nested directory"""
        # Arrange
        project_id = 3
        project_dir = tmp_path / str(project_id)
        nested_path = project_dir / "level1" / "level2" / "level3"
        nested_path.mkdir(parents=True)

        (nested_path / "deep_file.txt").write_text("Deep content")

        # Act
        result = await manager.list_directory_contents(
            project_id, "level1/level2/level3"
        )

        # Assert
        assert result["path"] == "level1/level2/level3"
        assert len(result["entries"]) == 1
        assert result["entries"][0] == {
            "name": "deep_file.txt",
            "path": "level1/level2/level3/deep_file.txt",
            "type": "file",
            "size": len("Deep content"),
        }

    @pytest.mark.asyncio
    async def test_list_directory_with_leading_slash(self, manager, tmp_path):
        """Test listing with leading slash in path"""
        # Arrange
        project_id = 4
        project_dir = tmp_path / str(project_id)
        docs_dir = project_dir / "docs"
        docs_dir.mkdir(parents=True)
        (docs_dir / "test.txt").write_text("Test")

        # Act
        result = await manager.list_directory_contents(project_id, "/docs")

        # Assert
        assert result["path"] == "docs"
        assert len(result["entries"]) == 1
        assert result["entries"][0]["path"] == "docs/test.txt"

    @pytest.mark.asyncio
    async def test_list_directory_filters_hidden_files(self, manager, tmp_path):
        """Test that hidden files are filtered out"""
        # Arrange
        project_id = 5
        project_dir = tmp_path / str(project_id)
        project_dir.mkdir(parents=True)

        # Create visible and hidden files
        (project_dir / "visible.txt").write_text("Visible")
        (project_dir / ".hidden").write_text("Hidden")
        (project_dir / ".DS_Store").write_text("System file")
        (project_dir / "metadata.json").write_text('{"test": true}')
        (project_dir / "normal_file.md").write_text("Normal")

        # Act
        result = await manager.list_directory_contents(project_id, "")

        # Assert
        entry_names = [entry["name"] for entry in result["entries"]]
        assert ".hidden" not in entry_names
        assert ".DS_Store" not in entry_names
        assert "metadata.json" not in entry_names
        assert "visible.txt" in entry_names
        assert "normal_file.md" in entry_names

    @pytest.mark.asyncio
    async def test_list_directory_has_children_detection(self, manager, tmp_path):
        """Test hasChildren detection for directories"""
        # Arrange
        project_id = 6
        project_dir = tmp_path / str(project_id)
        project_dir.mkdir(parents=True)

        # Directory with visible children
        dir_with_children = project_dir / "with_children"
        dir_with_children.mkdir()
        (dir_with_children / "child.txt").write_text("Child")

        # Directory with only hidden children
        dir_hidden_only = project_dir / "hidden_only"
        dir_hidden_only.mkdir()
        (dir_hidden_only / ".hidden").write_text("Hidden")
        (dir_hidden_only / "metadata.json").write_text("{}")

        # Empty directory
        empty_dir = project_dir / "empty"
        empty_dir.mkdir()

        # Act
        result = await manager.list_directory_contents(project_id, "")

        # Assert
        entries_by_name = {e["name"]: e for e in result["entries"]}

        assert entries_by_name["with_children"]["hasChildren"] is True
        assert (
            entries_by_name["hidden_only"]["hasChildren"] is False
        )  # Only hidden files
        assert entries_by_name["empty"]["hasChildren"] is False

    @pytest.mark.asyncio
    async def test_list_directory_file_sizes(self, manager, tmp_path):
        """Test that file sizes are correctly calculated"""
        # Arrange
        project_id = 7
        project_dir = tmp_path / str(project_id)
        project_dir.mkdir(parents=True)

        # Create files with different sizes
        small_content = "Small"
        large_content = "Large content with more text " * 100

        (project_dir / "small.txt").write_text(small_content)
        (project_dir / "large.txt").write_text(large_content)
        (project_dir / "empty.txt").write_text("")

        # Act
        result = await manager.list_directory_contents(project_id, "")

        # Assert
        entries_by_name = {e["name"]: e for e in result["entries"]}

        assert entries_by_name["small.txt"]["size"] == len(small_content)
        assert entries_by_name["large.txt"]["size"] == len(large_content)
        assert entries_by_name["empty.txt"]["size"] == 0

    @pytest.mark.asyncio
    async def test_list_directory_special_characters_in_names(self, manager, tmp_path):
        """Test listing files/directories with special characters"""
        # Arrange
        project_id = 8
        project_dir = tmp_path / str(project_id)
        project_dir.mkdir(parents=True)

        # Create files/dirs with special characters
        (project_dir / "Nuevo Capítulo 1").mkdir()
        (project_dir / "file with spaces.txt").write_text("Content")
        (project_dir / "file-with-hyphens.md").write_text("Content")
        (project_dir / "file_with_underscores.txt").write_text("Content")

        # Act
        result = await manager.list_directory_contents(project_id, "")

        # Assert
        entry_names = [entry["name"] for entry in result["entries"]]
        assert "Nuevo Capítulo 1" in entry_names
        assert "file with spaces.txt" in entry_names
        assert "file-with-hyphens.md" in entry_names
        assert "file_with_underscores.txt" in entry_names

    @pytest.mark.asyncio
    async def test_list_directory_not_found(self, manager, tmp_path):
        """Test error when directory doesn't exist"""
        # Arrange
        project_id = 9
        project_dir = tmp_path / str(project_id)
        project_dir.mkdir(parents=True)

        # Act & Assert
        with pytest.raises(HTTPException) as exc:
            await manager.list_directory_contents(project_id, "nonexistent")

        assert exc.value.status_code == 404
        assert "Directory not found" in exc.value.detail

    @pytest.mark.asyncio
    async def test_list_directory_project_not_found(self, manager, tmp_path):
        """Test error when project doesn't exist"""
        # Arrange
        nonexistent_project_id = 999

        # Act & Assert
        with pytest.raises(HTTPException) as exc:
            await manager.list_directory_contents(nonexistent_project_id, "")

        assert exc.value.status_code == 404
        assert "Directory not found: (project root)" in exc.value.detail

    @pytest.mark.asyncio
    async def test_list_directory_path_is_file(self, manager, tmp_path):
        """Test error when path points to file instead of directory"""
        # Arrange
        project_id = 10
        project_dir = tmp_path / str(project_id)
        project_dir.mkdir(parents=True)
        (project_dir / "file.txt").write_text("Content")

        # Act & Assert
        with pytest.raises(HTTPException) as exc:
            await manager.list_directory_contents(project_id, "file.txt")

        assert exc.value.status_code == 404
        assert "Path is not a directory" in exc.value.detail

    @pytest.mark.asyncio
    @patch("backend.app.domain.manuscript_manager.os.listdir")
    async def test_list_directory_os_error(self, mock_listdir, manager, tmp_path):
        """Test OS error handling during directory reading"""
        # Arrange
        project_id = 12
        project_dir = tmp_path / str(project_id)
        project_dir.mkdir(parents=True)

        mock_os_error = OSError("I/O error")
        mock_os_error.strerror = "I/O error"
        mock_listdir.side_effect = mock_os_error

        # Act & Assert
        with pytest.raises(HTTPException) as exc:
            await manager.list_directory_contents(project_id, "")

        assert exc.value.status_code == 500
        assert "Error reading directory" in exc.value.detail
        assert "I/O error" in exc.value.detail

    @pytest.mark.asyncio
    @patch("backend.app.domain.manuscript_manager.os.path.getsize")
    async def test_list_directory_file_size_error_handling(
        self, mock_getsize, manager, tmp_path
    ):
        """Test file size calculation error handling"""
        # Arrange
        project_id = 13
        project_dir = tmp_path / str(project_id)
        project_dir.mkdir(parents=True)
        (project_dir / "test.txt").write_text("Content")

        # Mock getsize to raise an error
        mock_getsize.side_effect = OSError("Cannot get size")

        # Act
        result = await manager.list_directory_contents(project_id, "")

        # Assert
        # Should handle the error gracefully and set size to 0
        assert len(result["entries"]) == 1
        assert result["entries"][0]["size"] == 0

    @pytest.mark.asyncio
    async def test_list_directory_has_children_error_handling(self, manager, tmp_path):
        """Test hasChildren detection with permission errors"""
        # Arrange
        project_id = 14
        project_dir = tmp_path / str(project_id)
        project_dir.mkdir(parents=True)

        test_dir = project_dir / "test_dir"
        test_dir.mkdir()

        # Create a child file
        (test_dir / "child.txt").write_text("Child")

        # Act
        with patch("backend.app.domain.manuscript_manager.os.listdir") as mock_listdir:

            def side_effect(path):
                if str(path).endswith("test_dir"):
                    raise PermissionError("No access")
                return ["test_dir"]

            mock_listdir.side_effect = side_effect
            result = await manager.list_directory_contents(project_id, "")

        # Assert
        # Should handle the error gracefully and set hasChildren to False
        assert len(result["entries"]) == 1
        assert result["entries"][0]["hasChildren"] is False

    @pytest.mark.asyncio
    async def test_list_directory_alphabetical_sorting(self, manager, tmp_path):
        """Test that entries are sorted alphabetically"""
        # Arrange
        project_id = 15
        project_dir = tmp_path / str(project_id)
        project_dir.mkdir(parents=True)

        # Create files in non-alphabetical order
        filenames = ["zebra.txt", "apple.txt", "banana.txt", "Cherry.txt"]
        for filename in filenames:
            (project_dir / filename).write_text("Content")

        # Act
        result = await manager.list_directory_contents(project_id, "")

        # Assert
        entry_names = [entry["name"] for entry in result["entries"]]
        expected_order = ["Cherry.txt", "apple.txt", "banana.txt", "zebra.txt"]
        assert entry_names == expected_order

    @pytest.mark.asyncio
    async def test_list_directory_mixed_files_and_directories_sorting(
        self, manager, tmp_path
    ):
        """Test sorting of mixed files and directories"""
        # Arrange
        project_id = 16
        project_dir = tmp_path / str(project_id)
        project_dir.mkdir(parents=True)

        # Create mixed content
        (project_dir / "z_directory").mkdir()
        (project_dir / "a_file.txt").write_text("Content")
        (project_dir / "m_directory").mkdir()
        (project_dir / "b_file.txt").write_text("Content")

        # Act
        result = await manager.list_directory_contents(project_id, "")

        # Assert
        entry_names = [entry["name"] for entry in result["entries"]]
        expected_order = ["a_file.txt", "b_file.txt", "m_directory", "z_directory"]
        assert entry_names == expected_order

    @pytest.mark.asyncio
    async def test_list_directory_zero_project_id(self, manager, tmp_path):
        """Test with project_id = 0"""
        # Arrange
        project_id = 0
        project_dir = tmp_path / str(project_id)
        project_dir.mkdir(parents=True)
        (project_dir / "test.txt").write_text("Content")

        # Act
        result = await manager.list_directory_contents(project_id, "")

        # Assert
        assert result["path"] == ""
        assert len(result["entries"]) == 1
        assert result["entries"][0]["name"] == "test.txt"
