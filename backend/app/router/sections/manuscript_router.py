from fastapi import APIRouter, UploadFile, File, Form

from backend.app.domain.manuscript_manager import ManuscriptManager
from backend.app.schemas.sections.manuscript_schemas import (
    SaveStartRequest,
    DeleteManuscriptRequest,
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


@manuscript_router.delete("/")
async def delete_file(request: DeleteManuscriptRequest):
    await manuscript_manager.delete_path(request.project_id, request.path)
    return {"path": request.path}
