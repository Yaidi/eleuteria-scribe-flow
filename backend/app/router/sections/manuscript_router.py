from urllib.parse import unquote

from fastapi import APIRouter, UploadFile, File, Form

from backend.app.domain.manuscript_manager import ManuscriptManager
from backend.app.schemas.sections.manuscript_schemas import (
    SaveStartRequest,
    GetManuscriptContentRequest,
)

manuscript_router = APIRouter(prefix="/manuscript", tags=["Manuscript API"])
manuscript_manager = ManuscriptManager()


# 1 - Save Chunks using UploadFile
@manuscript_router.post("/save/start")
async def start_save(request: SaveStartRequest):

    session_id = manuscript_manager.start_manuscript_save_session(request)

    return {"session_id": session_id}


# 2 - Save Chunks using UploadFile
@manuscript_router.post("/save/chunk/{session_id}")
async def save_chunk(
    session_id: str, file: UploadFile = File(...), relative_path: str = Form(...)
):

    await manuscript_manager.save_manuscript_chunk(session_id, file)

    return {"ok": True}


# 3 - Finish Save Session - Make temp files persist.
@manuscript_router.post("/save/finish/{session_id}")
async def finish_save(session_id: str):

    return await manuscript_manager.finish_manuscript_save_session(session_id)


@manuscript_router.delete("/project/{project_id}/file/{path:path}")
async def delete_file(project_id: int, path: str):
    """
    Delete a file or directory from the manuscript storage.

    Args:
        project_id (int): The project identifier
        path (str): The relative path to the file or directory to delete.
                   Can include subdirectories (e.g., "docs/chapter1.md")

    Returns:
        dict: Confirmation with the deleted path

    Examples:
        DELETE /manuscript/project/123/file/chapter1.md
        DELETE /manuscript/project/123/file/docs/scenes/intro.txt
        DELETE /manuscript/project/123/file/old_drafts  (directory)

    Raises:
        HTTPException: 404 if file/directory not found
        HTTPException: 403 if insufficient permissions
        HTTPException: 500 for other OS errors
    """

    await manuscript_manager.delete_path(project_id, path)
    return {"path": path}


@manuscript_router.post("/content")
async def get_file_content(request: GetManuscriptContentRequest):
    content = await manuscript_manager.get_manuscript_file_content(
        request.project_id, request.path
    )
    return {"content": content}


@manuscript_router.get(
    "/list/{project_id}",
    responses={
        200: {
            "description": "Directory listing successful with grouped structure",
            "content": {
                "application/json": {
                    "example": {
                        "path": "",
                        "entries": [
                            {
                                "name": "chapters",
                                "path": "chapters",
                                "type": "directory",
                                "files": [
                                    {
                                        "name": "intro.md",
                                        "path": "chapters/intro.md",
                                        "type": "file",
                                        "size": 1024,
                                    },
                                    {
                                        "name": "chapter1.md",
                                        "path": "chapters/chapter1.md",
                                        "type": "file",
                                        "size": 2048,
                                    },
                                ],
                            },
                            {
                                "name": "scenes",
                                "path": "scenes",
                                "type": "directory",
                                "files": [
                                    {
                                        "name": "scene1.md",
                                        "path": "scenes/scene1.md",
                                        "type": "file",
                                        "size": 1536,
                                    }
                                ],
                            },
                        ],
                    }
                }
            },
        },
        404: {
            "description": "Project directory not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Project directory not found: 123"}
                }
            },
        },
        403: {
            "description": "Permission denied",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Insufficient permission to read project directory: 123"
                    }
                }
            },
        },
        500: {
            "description": "Internal server error",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Error reading project directory 123: Permission denied"
                    }
                }
            },
        },
    },
)
async def list_directory(project_id: int):
    """
    List all directories and their files in the manuscript storage.

    This endpoint returns a grouped structure where each directory contains
    all its files (including files from subdirectories). The structure is
    flattened to only show main directories with their complete file lists.

    Args:
        project_id (int): The project identifier

    Returns:
        dict: Directory listing with grouped structure containing:
            - path (str): Empty string (always project root)
            - entries (list): List of directories, each containing:
                - name (str): Directory name
                - path (str): Directory relative path
                - type (str): Always "directory"
                - files (list): All files within this directory, each with:
                    - name (str): File name
                    - path (str): File relative path from project root
                    - type (str): Always "file"
                    - size (int): File size in bytes

    Examples:
        GET /manuscript/list/123

        Response structure groups all files by their parent directories:
        - All files in "chapters/" directory (including subdirectories) are listed under chapters
        - All files in "scenes/" directory (including subdirectories) are listed under scenes
        - Each directory entry contains its complete file inventory

    Raises:
        HTTPException (404): If the project directory doesn't exist
        HTTPException (403): If insufficient permissions to read the project directory
        HTTPException (500): If an unexpected OSError occurs during directory traversal
    """
    return await manuscript_manager.list_directory_contents(project_id)
