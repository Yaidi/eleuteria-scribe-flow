import json
import shutil
import uuid
import tempfile

import aiofiles
import os

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form

from backend.app.schemas.manuscript_schemas import SaveStartRequest

manuscript_router = APIRouter(prefix="/manuscript", tags=["Plot"])
UPLOAD_DIR = "manuscripts/"
os.makedirs(UPLOAD_DIR, exist_ok=True)

sessions = {}

@manuscript_router.post("/save/start")
async def start_save(request: SaveStartRequest):
    project_path = os.path.join(UPLOAD_DIR, str(request.project_id))

    # Asegurar que relative_path no comience con /
    relative_path = request.relative_path.lstrip('/')
    if not relative_path:
        relative_path = "."

    full_dir = os.path.join(project_path, relative_path)
    os.makedirs(full_dir, exist_ok=True)

    session_id = str(uuid.uuid4())
    temp_dir = tempfile.gettempdir()
    temp_path = os.path.join(temp_dir, f"{request.filename}.{session_id}.part")

    sessions[session_id] = {
        "project_path": project_path,
        "relative_path": relative_path,
        "filename": request.filename,
        "temp_path": temp_path
    }

    return {"session_id": session_id}


# 2️⃣ Guardar chunks usando UploadFile
@manuscript_router.post("/save/chunk/{session_id}")
async def save_chunk(session_id: str, file: UploadFile = File(...), relative_path: str = Form(...)):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Invalid session ID")

    temp_path = sessions[session_id]["temp_path"]

    try:
        # Leer el archivo recibido en chunks y escribir en el temporal
        async with aiofiles.open(temp_path, "ab") as f:
            while chunk := await file.read(1024 * 32):  # 32 KB por chunk
                await f.write(chunk)
    except OSError as e:
        raise HTTPException(status_code=500, detail=f"Error writing to temporary file: {str(e)}")


    return {"ok": True}


# 3️⃣ Finalizar guardado
@manuscript_router.post("/save/finish/{session_id}")
async def finish_save(session_id: str):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Invalid session ID")

    data = sessions[session_id]

    # Construir la ruta final correctamente
    final_path = os.path.join(data["project_path"], data["relative_path"], data["filename"])

    # Asegurar que el directorio de destino existe
    os.makedirs(str(os.path.dirname(final_path)), exist_ok=True)

    try:
        # Usar shutil.move en lugar de os.replace para manejar cross-device links
        shutil.move(data["temp_path"], str(final_path))
    except OSError as e:
        # Limpiar archivo temporal si hay error
        if os.path.exists(data["temp_path"]):
            try:
                os.remove(data["temp_path"])
            except:
                pass  # Ignorar errores al limpiar
        raise HTTPException(status_code=500, detail=f"Error moving file to final destination: {str(e)}")

    # Actualizar metadata en la carpeta específica donde se guardó el archivo
    folder_path = os.path.join(data["project_path"], data["relative_path"])
    metadata_path = os.path.join(folder_path, "metadata.json")
    metadata = {}

    if os.path.exists(metadata_path):
        try:
            async with aiofiles.open(metadata_path, "r") as f:
                content = await f.read()
                metadata = json.loads(content)
        except (json.JSONDecodeError, OSError):
            metadata = {}  # Si hay error leyendo, empezar con metadata vacío


    dir_name = os.path.basename(data["relative_path"].rstrip('/')) or "root"

    # Agregar/actualizar la información del archivo
    metadata[dir_name] = {
        "created_at": os.path.getctime(final_path),
        "modified_at": os.path.getmtime(final_path),
    }

    try:
        async with aiofiles.open(metadata_path, "w") as f:
            await f.write(json.dumps(metadata, indent=2))
    except OSError as e:
        # Si no podemos escribir metadata, al menos el archivo se guardó
        print(f"Warning: Could not update metadata: {str(e)}")

    del sessions[session_id]
    return {
        "saved": final_path,
        "metadata": metadata[dir_name],
        "metadata_location": metadata_path
    }


@manuscript_router.get("/list/{project_id}")
async def list_files(project_id: int, folder_path: str = ""):
    """Lista todos los archivos de una carpeta específica con su metadata"""
    project_path = os.path.join(UPLOAD_DIR, str(project_id))

    # Limpiar folder_path
    folder_path = folder_path.strip().lstrip('/')
    if not folder_path:
        folder_path = "."

    full_folder_path = os.path.join(project_path, folder_path)
    metadata_path = os.path.join(full_folder_path, "metadata.json")

    if not os.path.exists(full_folder_path):
        raise HTTPException(status_code=404, detail="Folder not found")

    # Leer metadata si existe
    metadata = {}
    if os.path.exists(metadata_path):
        try:
            async with aiofiles.open(metadata_path, "r") as f:
                content = await f.read()
                metadata = json.loads(content)
        except (json.JSONDecodeError, OSError):
            metadata = {}

    # Listar archivos físicos y combinar con metadata
    files = []
    try:
        for item in os.listdir(full_folder_path):
            item_path = os.path.join(full_folder_path, item)

            # Saltar el metadata.json y directorios
            if item == "metadata.json" or os.path.isdir(item_path):
                continue

            stat = os.stat(item_path)
            file_info = {
                "filename": item,
                "size": stat.st_size,
                "created_at": stat.st_ctime,
                "modified_at": stat.st_mtime
            }

            # Agregar metadata si existe
            if item in metadata:
                file_info.update(metadata[item])
            else:
                file_info["title"] = item  # Usar filename como título por defecto

            files.append(file_info)
    except OSError:
        files = []

    return {
        "project_id": project_id,
        "folder_path": folder_path,
        "files": files
    }


@manuscript_router.get("/read/{project_id}")
async def read_file_content(project_id: int, filename: str, folder_path: str = ""):
    """Lee el contenido de un archivo de texto"""
    project_path = os.path.join(UPLOAD_DIR, str(project_id))

    # Limpiar folder_path
    folder_path = folder_path.strip().lstrip('/')
    if not folder_path:
        folder_path = "."

    full_folder_path = os.path.join(project_path, folder_path)
    file_path = os.path.join(full_folder_path, filename)
    metadata_path = os.path.join(full_folder_path, "metadata.json")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    # Leer metadata si existe
    metadata = {}
    if os.path.exists(metadata_path):
        try:
            async with aiofiles.open(metadata_path, "r") as f:
                content = await f.read()
                metadata = json.loads(content)
        except (json.JSONDecodeError, OSError):
            metadata = {}

    try:
        async with aiofiles.open(file_path, "r", encoding="utf-8") as f:
            content = await f.read()

        file_metadata = metadata.get(filename, {"title": filename})

        return {
            "filename": filename,
            "folder_path": folder_path,
            "title": file_metadata.get("title", filename),
            "content": content,
            "size": len(content.encode('utf-8'))
        }
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400,
            detail="File is not a text file or has unsupported encoding"
        )


@manuscript_router.delete("/delete/{project_id}")
async def delete_file(project_id: int, filename: str, folder_path: str = ""):
    """Elimina un archivo del proyecto"""
    project_path = os.path.join(UPLOAD_DIR, str(project_id))

    # Limpiar folder_path
    folder_path = folder_path.strip().lstrip('/')
    if not folder_path:
        folder_path = "."

    full_folder_path = os.path.join(project_path, folder_path)
    file_path = os.path.join(full_folder_path, filename)
    metadata_path = os.path.join(full_folder_path, "metadata.json")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    # Eliminar archivo físico
    os.remove(file_path)

    # Actualizar metadata
    metadata = {}
    if os.path.exists(metadata_path):
        try:
            async with aiofiles.open(metadata_path, "r") as f:
                content = await f.read()
                metadata = json.loads(content)
        except (json.JSONDecodeError, OSError):
            metadata = {}

    # Remover de metadata si existe
    if filename in metadata:
        del metadata[filename]

        # Actualizar metadata.json
        try:
            if metadata:  # Si queda metadata, actualizar
                async with aiofiles.open(metadata_path, "w") as f:
                    await f.write(json.dumps(metadata, indent=2))
            else:  # Si no queda metadata, eliminar el archivo
                if os.path.exists(metadata_path):
                    os.remove(metadata_path)
        except OSError:
            pass  # Ignorar errores al escribir metadata

    return {"message": f"File '{filename}' deleted successfully"}