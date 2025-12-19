import json
import os
import shutil
import tempfile
import uuid
import aiofiles

from fastapi import HTTPException, UploadFile
from backend.app.schemas.sections.manuscript_schemas import SaveStartRequest


class ManuscriptManager:
    UPLOAD_DIR = "manuscripts/"
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    sessions = {}

    def __init__(self):
        pass

    def start_manuscript_save_session(self, request: SaveStartRequest) -> str:
        """
        Initiates a new manuscript file save session for chunked upload.

        This method sets up the necessary directory structure and creates a unique
        session to handle the chunked upload of a manuscript file. It prepares the
        temporary file path and stores session metadata for later chunk operations.

        Args:
            request (SaveStartRequest): Request object containing:
                - project_id: Identifier for the project where the file will be saved
                - relative_path: Relative path within the project directory
                - filename: Name of the file to be uploaded

        Returns:
            str: Unique session identifier (UUID) that must be used for later
                 chunk upload operations and session completion

        Raises:
            OSError: If directory creation fails due to permissions or disk space issues

        Note:
            - Creates the target directory structure if it doesn't exist
            - Normalizes the relative_path by removing leading slashes
            - Uses "." as relative_path if empty (root of project directory)
            - Generates a temporary file with format: "{filename}.{session_id}.part"
            - Stores session data in memory for later retrieval during chunk operations
            - The session must be completed with finish_manuscript_save_session()

        Directory Structure:
            ```
            manuscripts/
            ├── {project_id}/
            │   ├── {relative_path}/
            │   │   └── {filename}  # Final location
            └── temp/
                └── {filename}.{session_id}.part  # Temporary file
            ```

        Example:
            ```python
            request = SaveStartRequest(
                project_id=123,
                relative_path="documents/drafts",
                filename="chapter1.docx"
            )
            session_id = manager.start_manuscript_save_session(request)
            # session_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
            ```
        """
        project_path = os.path.join(self.UPLOAD_DIR, str(request.project_id))
        session_id = str(uuid.uuid4())

        # Make sure relative_path doesn't start with /
        relative_path = request.relative_path.lstrip("/")
        if not relative_path:
            relative_path = "."

        full_dir = os.path.join(project_path, relative_path)
        os.makedirs(full_dir, exist_ok=True)

        temp_dir = tempfile.gettempdir()
        temp_path = os.path.join(temp_dir, f"{request.filename}.{session_id}.part")

        self.sessions[session_id] = {
            "project_path": project_path,
            "relative_path": relative_path,
            "filename": request.filename,
            "temp_path": temp_path,
        }

        return session_id

    async def save_manuscript_chunk(self, session_id: str, file: UploadFile):
        """
        Saves a chunk (fragment) of a manuscript file to a temporary file.

        This method is part of the chunked file upload system, enabling the upload
        of large files by splitting them into smaller fragments to improve efficiency
        and reduce memory usage.

        Args:
            session_id (str): Unique identifier for the save session previously
                             started with start_manuscript_save_session()
            file (UploadFile): FastAPI UploadFile object containing the file
                              fragment to be saved

        Raises:
            HTTPException:
                - 404: If the session_id doesn't exist in active sessions
                - 500: If an I/O error occurs while writing to the temporary file

        Returns:
            None: The method doesn't return any value but writes the chunk
                  content to the temporary file associated with the session

        Note:
            - The file is written in binary append mode ("ab") to concatenate
              all received chunks
            - Each chunk is processed in 32KB fragments to optimize memory usage
            - The temporary file is created in the system's temporary directory
            - This method must be called after start_manuscript_save_session()
              and before finish_manuscript_save_session()

        Example:
            ```python
            # First start the session
            session_id = manager.start_manuscript_save_session(request)

            # Then save each chunk
            await manager.save_manuscript_chunk(session_id, chunk_file)

            # Finally complete the session
            await manager.finish_manuscript_save_session(session_id)
            ```
        """
        if session_id not in self.sessions:
            raise HTTPException(status_code=404, detail="Invalid session ID")

        temp_path = self.sessions[session_id]["temp_path"]

        try:
            # Leer el archivo recibido en chunks y escribir en el temporal
            async with aiofiles.open(temp_path, "ab") as f:
                while chunk := await file.read(1024 * 32):  # 32 KB por chunk
                    await f.write(chunk)
        except OSError as e:
            raise HTTPException(
                status_code=500, detail=f"Error writing to temporary file: {str(e)}"
            )

    @staticmethod
    async def _move_temp_file_to_final_destination(session_data: dict) -> str:
        """
        Moves the temporary file to its final destination.

        Returns:
            str: The final file path
        """
        final_path = os.path.join(
            session_data["project_path"],
            session_data["relative_path"],
            session_data["filename"],
        )

        """
        Creates the destination directory if it doesn't exist.
        """
        os.makedirs(str(os.path.dirname(final_path)), exist_ok=True)

        temp_path = session_data["temp_path"]

        try:
            shutil.move(temp_path, str(final_path))
            return str(final_path)
        except OSError as e:
            if os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                except OSError:
                    pass

            raise HTTPException(
                status_code=500,
                detail=f"Error moving file to final destination: {str(e)}",
            )

    @staticmethod
    async def _update_file_metadata(session_data: dict, final_path: str) -> dict:
        """
        Updates the metadata.json file with file information.

        Returns:
            dict: Dictionary containing metadata and metadata_path
        """

        # Actualizar metadata en la carpeta específica donde se guardó el archivo
        folder_path = os.path.join(
            session_data["project_path"], session_data["relative_path"]
        )
        metadata_path = os.path.join(str(folder_path), "metadata.json")
        metadata = {}

        if os.path.exists(metadata_path):
            try:
                async with aiofiles.open(metadata_path, "r") as f:
                    content = await f.read()
                    metadata = json.loads(content)
            except (json.JSONDecodeError, OSError):
                metadata = {}  # Si hay error leyendo, empezar con metadata vacío

        dir_name = os.path.basename(session_data["relative_path"].rstrip("/")) or "root"

        # update metadata times
        metadata[dir_name] = {
            "created_at": os.path.getctime(final_path),
            "modified_at": os.path.getmtime(final_path),
        }

        try:
            async with aiofiles.open(metadata_path, "w") as f:
                await f.write(json.dumps(metadata, indent=2))
        except OSError as e:
            # If not able to write metadata...
            print(f"Warning: Could not update metadata: {str(e)}")

        return {"metadata": metadata[dir_name], "metadata_path": metadata_path}

    async def finish_manuscript_save_session(self, session_id: str):
        """
        Completes a manuscript file save session by finalizing the upload process.

        This method moves the temporary file to its final destination, updates metadata,
        and cleans up the session. It's the final step in the chunked file upload process
        and ensures data integrity by handling file operations and metadata management.

        Args:
            session_id (str): Unique session identifier previously created by
                             start_manuscript_save_session()

        Returns:
            dict: A dictionary containing:
                - saved (str): Full path where the file was saved
                - metadata (dict): File metadata with creation and modification times
                - metadata_location (str): Path to the metadata.json file

        Raises:
            HTTPException:
                - 404: If the session_id doesn't exist in active sessions
                - 500: If file move operation fails or other I/O errors occur

        Process Flow:
            1. Validates session existence
            2. Constructs final file path
            3. Ensures destination directory exists
            4. Moves a temporary file to the final location
            5. Updates/creates metadata.json file
            6. Cleans up session data
            7. Returns operation results

        Metadata Structure:
            ```JSON
            {
                "directory_name": {
                    "created_at": 1640995200.0,
                    "modified_at": 1640995200.0
                }
            }
            ```

        Error Handling:
            - Automatically cleans up temporary files on move failure
            - Continues execution even if metadata writing fails (with warning)
            - Uses shutil.move() to handle cross-device file moves
            - Gracefully handles corrupted or missing metadata files

        Note:
            - The session is automatically deleted after successful completion
            - Metadata is stored per directory, not per file
            - Uses system temporary directory for intermediate storage
            - File timestamps are captured from the final file location

        Example:
            ```python
            # Complete the upload process
            result = await manager.finish_manuscript_save_session(session_id)

            # Result structure:
            {
                "saved": "/manuscripts/123/documents/chapter1.docx",
                "metadata": {
                    "created_at": 1640995200.0,
                    "modified_at": 1640995200.0
                },
                "metadata_location": "/manuscripts/123/documents/metadata.json"
            }
            ```
        """

        if session_id not in self.sessions:
            raise HTTPException(status_code=404, detail="Invalid session ID")

        data = self.sessions[session_id]

        # persist temporary files and create a final path
        final_path = await self._move_temp_file_to_final_destination(data)

        # generate metadata associated with the folder name
        metadata = await self._update_file_metadata(data, final_path)
        del self.sessions[session_id]

        return {
            "saved": final_path,
            "metadata": metadata["metadata"],
            "metadata_location": metadata["metadata_path"],
        }

    async def delete_path(self, project_id: int, path: str):
        """
        Delete a file or directory from the project storage.

        This method resolves the absolute path for a given `project_id` and `path`,
        then attempts to remove it. Both files and directories are supported.
        If the path points to a file, it is deleted with `os.remove`.
        If it points to a directory, it is recursively removed with `shutil.rmtree`.

        Args:
            project_id (int): Unique identifier of the project. Used to determine
                the root directory of the project inside `ROOT_DIR`.
            path (str): Relative path (from the project root) to the file or
                directory to be deleted. Leading slashes (`/`) are stripped.
                If an empty string or `/` is provided, it resolves to the project root.

        Raises:
            HTTPException (404): If the given path does not exist within the project directory.
            HTTPException (403): If the process lacks permissions to delete the specified file or directory.
            HTTPException (500): If an unexpected `OSError` occurs during deletion.

        Examples:
            - await manager.delete_path(1, "docs/readme.md")
            # Deletes the file "readme.md" inside project 1's docs folder.

            - await manager.delete_path(2, "temp/")
            # Recursively deletes the "temp" directory inside project 2.

        Notes:
            - Paths are resolved relative to the project's root directory.
            - The method ensures that leading slashes in the provided path
              are stripped to avoid absolute path resolution.
        """

        project_path = os.path.join(self.ROOT_DIR, str(project_id))

        # Make sure relative_path doesn't start with /
        relative_path = path.lstrip("/")
        if not relative_path:
            relative_path = "."

        full_dir = os.path.join(project_path, relative_path)

        try:
            if os.path.isfile(full_dir):
                os.remove(full_dir)
            elif os.path.isdir(full_dir):
                shutil.rmtree(full_dir)
            else:
                raise HTTPException(
                    status_code=404, detail=f"File or Path not found: {path}"
                )
        except PermissionError:
            raise HTTPException(
                status_code=403, detail=f"Insufficient permission to delete: {path}"
            )
        except OSError as e:
            raise HTTPException(
                status_code=500, detail=f"Error deleting {path}: {e.strerror}"
            )
