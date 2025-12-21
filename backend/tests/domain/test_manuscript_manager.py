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
        result = await manager.list_directory_contents(project_id)

        # Assert
        assert result["path"] == ""
        assert result["chapters"] == []

    @pytest.mark.asyncio
    async def test_list_project_with_chapters_and_scenes(self, manager, tmp_path):
        """Test listing project with chapters and scenes"""
        # Arrange
        project_id = 1
        project_dir = tmp_path / str(project_id)
        project_dir.mkdir(parents=True)

        # Create chapter directories with scene files
        chapters_dir = project_dir / "Chapter 1"
        chapters_dir.mkdir()
        (chapters_dir / "scene1.md").write_text("Scene 1 content")
        (chapters_dir / "scene2.md").write_text("Scene 2 content")

        scenes_dir = project_dir / "Chapter 2"
        scenes_dir.mkdir()
        (scenes_dir / "opening.md").write_text("Opening scene")

        # Act
        result = await manager.list_directory_contents(project_id)

        # Assert
        assert result["path"] == ""
        assert len(result["chapters"]) == 2

        # Check chapters are sorted alphabetically
        chapter_titles = [chapter["title"] for chapter in result["chapters"]]
        assert chapter_titles == ["Chapter 1", "Chapter 2"]

        # Check first chapter structure
        chapter1 = next(c for c in result["chapters"] if c["title"] == "Chapter 1")
        assert chapter1["path"] == "Chapter 1"
        assert len(chapter1["scenes"]) == 2

        # Check scene structure
        scene_titles = [scene["title"] for scene in chapter1["scenes"]]
        assert "scene1.md" in scene_titles
        assert "scene2.md" in scene_titles

        # Check scene paths
        scene1 = next(s for s in chapter1["scenes"] if s["title"] == "scene1.md")
        assert scene1["path"] == "Chapter 1/scene1.md"
        assert scene1["content"] == ""

    @pytest.mark.asyncio
    async def test_list_project_with_nested_scenes(self, manager, tmp_path):
        """Test listing project with scenes in subdirectories"""
        # Arrange
        project_id = 2
        project_dir = tmp_path / str(project_id)
        project_dir.mkdir(parents=True)

        # Create chapter with nested subdirectories
        chapter_dir = project_dir / "Chapter 1"
        chapter_dir.mkdir()

        # Scene in chapter root
        (chapter_dir / "intro.md").write_text("Intro content")

        # Act
        result = await manager.list_directory_contents(project_id)

        # Assert
        assert len(result["chapters"]) == 1
        chapter = result["chapters"][0]
        assert chapter["title"] == "Chapter 1"

        # Should include both direct and nested scenes
        scene_paths = [scene["path"] for scene in chapter["scenes"]]
        assert "Chapter 1/intro.md" in scene_paths

    @pytest.mark.asyncio
    async def test_list_project_filters_hidden_and_metadata_files(
        self, manager, tmp_path
    ):
        """Test that hidden files and metadata.json are filtered out"""
        # Arrange
        project_id = 3
        project_dir = tmp_path / str(project_id)
        project_dir.mkdir(parents=True)

        # Create chapter directory
        chapter_dir = project_dir / "Chapter 1"
        chapter_dir.mkdir()

        # Create various files
        (chapter_dir / "scene.md").write_text("Scene content")
        (chapter_dir / ".hidden_file").write_text("Hidden")
        (chapter_dir / "metadata.json").write_text('{"test": true}')
        (chapter_dir / ".DS_Store").write_text("System file")

        # Create hidden directory (should be filtered)
        hidden_dir = project_dir / ".hidden_chapter"
        hidden_dir.mkdir()
        (hidden_dir / "scene.md").write_text("Hidden scene")

        # Act
        result = await manager.list_directory_contents(project_id)

        # Assert
        assert len(result["chapters"]) == 1  # Only visible chapter
        chapter = result["chapters"][0]
        assert chapter["title"] == "Chapter 1"

        # Only visible scene should be included
        scene_titles = [scene["title"] for scene in chapter["scenes"]]
        assert scene_titles == ["scene.md"]

    @pytest.mark.asyncio
    async def test_list_project_alphabetical_sorting(self, manager, tmp_path):
        """Test that chapters and scenes are sorted alphabetically"""
        # Arrange
        project_id = 4
        project_dir = tmp_path / str(project_id)
        project_dir.mkdir(parents=True)

        # Create chapters in non-alphabetical order
        for chapter_name in ["Zebra Chapter", "Apple Chapter", "Banana Chapter"]:
            chapter_dir = project_dir / chapter_name
            chapter_dir.mkdir()
            (chapter_dir / f"{chapter_name.lower()}.md").write_text("Content")

        # Act
        result = await manager.list_directory_contents(project_id)

        # Assert
        chapter_titles = [chapter["title"] for chapter in result["chapters"]]
        expected_order = ["Apple Chapter", "Banana Chapter", "Zebra Chapter"]
        assert chapter_titles == expected_order

    @pytest.mark.asyncio
    async def test_list_project_not_found(self, manager, tmp_path):
        """Test error when project doesn't exist"""
        # Arrange
        nonexistent_project_id = 999

        # Act & Assert
        with pytest.raises(HTTPException) as exc:
            await manager.list_directory_contents(nonexistent_project_id)

        assert exc.value.status_code == 404
        assert "Project directory not found: 999" in exc.value.detail

    @pytest.mark.asyncio
    async def test_list_project_os_error(self, manager, tmp_path):
        """Test OS error handling during directory traversal"""
        # Arrange
        project_id = 6
        project_dir = tmp_path / str(project_id)
        project_dir.mkdir(parents=True)

        # Act & Assert
        with patch("backend.app.domain.manuscript_manager.os.walk") as mock_walk:
            mock_os_error = OSError("I/O error")
            mock_os_error.strerror = "I/O error"
            mock_walk.side_effect = mock_os_error

            with pytest.raises(HTTPException) as exc:
                await manager.list_directory_contents(project_id)

            assert exc.value.status_code == 500
            assert "Error reading project directory 6: I/O error" in exc.value.detail

    @pytest.mark.asyncio
    async def test_list_project_path_is_not_directory(self, manager, tmp_path):
        """Test error when project path points to a file instead of directory"""
        # Arrange
        project_id = 7
        project_file = tmp_path / str(project_id)
        project_file.write_text("This is a file, not a directory")

        # Act & Assert
        with pytest.raises(HTTPException) as exc:
            await manager.list_directory_contents(project_id)

        assert exc.value.status_code == 404
        assert f"Project path is not a directory: {project_id}" in exc.value.detail
