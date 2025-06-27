from contextlib import asynccontextmanager

from fastapi import FastAPI
from sqlalchemy import event, Engine
from starlette.middleware.cors import CORSMiddleware

from .data.entities.project_entities import ProjectList, BaseProject, FictionProject, NonFictionProject, TesisProject
from .data.db.db import engine
from .router.project_router import projects_router


@event.listens_for(Engine, "connect")
def enable_sqlite_foreign_keys(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(
            ProjectList.metadata.create_all,
        )
        await conn.run_sync(
            BaseProject.metadata.create_all,
        )
        await conn.run_sync(
            FictionProject.metadata.create_all,
        )
        await conn.run_sync(
            NonFictionProject.metadata.create_all,
        )
        await conn.run_sync(
            TesisProject.metadata.create_all
        )
    yield


app = FastAPI(lifespan=lifespan)
app.include_router(projects_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ⚠️ Esto permite TODOS los orígenes
    allow_credentials=True,
    allow_methods=["*"],   # Permite todos los métodos (GET, POST, etc.)
    allow_headers=["*"],   # Permite todos los headers
)

@app.get("/")
def root():
    return {"status": "API funcionando"}

