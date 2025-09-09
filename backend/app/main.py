from backend.app.router.sections.manuscript_router import manuscript_router
from backend.app.router.sections.plot_router import plot_router
from backend.app.data.entities.project_entities import Base
from backend.app.data.db.db import engine
from backend.app.data.entities.sections.character_entities import Character
from backend.app.data.entities.sections.plot_entities import Plot, PlotStep
from backend.app.data.entities.sections.references_entities import ReferenceBase
from backend.app.data.entities.sections.source_entities import Sources
from backend.app.data.entities.sections.world_entities import World, WorldElement
from backend.app.router.sections.character_router import character_router
from backend.app.router.sections.world_router import world_router
from backend.app.router.project_router import projects_router

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import event


@event.listens_for(engine.sync_engine, "connect")
def enable_sqlite_foreign_keys(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(
            Base.metadata.create_all,
        )
        await conn.run_sync(
            ReferenceBase.metadata.create_all,
        )
        await conn.run_sync(
            Sources.metadata.create_all,
        )
        await conn.run_sync(
            Plot.metadata.create_all,
        )
        await conn.run_sync(
            PlotStep.metadata.create_all,
        )
        await conn.run_sync(
            World.metadata.create_all,
        )
        await conn.run_sync(
            WorldElement.metadata.create_all,
        )
        await conn.run_sync(
            Character.metadata.create_all,
        )
    yield


app = FastAPI(lifespan=lifespan)
app.include_router(projects_router)
app.include_router(world_router)
app.include_router(character_router)
app.include_router(plot_router)
app.include_router(manuscript_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ⚠️ Esto permite TODOS los orígenes
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos los métodos (GET, POST, etc.)
    allow_headers=["*"],  # Permite todos los headers
)


@app.get("/")
def root():
    return {"status": "API funcionando"}
