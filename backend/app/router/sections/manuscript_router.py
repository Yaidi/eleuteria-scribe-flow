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
