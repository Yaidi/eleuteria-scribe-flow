from typing import List

from backend.app.data.entities.project_entities import (
    FictionProject,
    NonFictionProject,
    BaseProject,
    ThesisProject,
    PoetryProject,
)
from backend.app.schemas.sections.character_schemas import CharacterSchema
from backend.app.schemas.project_schemas import (
    CreateProjectRequest,
    General,
    Sections,
    BaseProjectSchema,
    ProjectResponseList, ProjectType,
)
from backend.app.schemas.sections.plot_schemas import PlotSchemaWithSteps
from backend.app.schemas.sections.world_schemas import (
    WorldWithElementsSchema,
    WorldElementDetailedSchema,
)


def project_on_response_list(project: BaseProject) -> ProjectResponseList:
    base_kwargs = {
        "id": project.id,
        "projectListID": project.projectListID,
        "projectName": project.project_name,
        "type": ProjectType(project.type),
        "wordGoal": project.word_goal,
        "words": project.words,
        "status": project.status,
        "description": project.description,
        "created": project.created_at,
        "updated": project.updated_at
    }
    return ProjectResponseList(**base_kwargs)


def create_project_object_from_request(data: CreateProjectRequest):
    match data.type:
        case ProjectType.novel:
            return FictionProject(projectListID=data.projectListID, type=data.type)
        case ProjectType.non_fiction:
            return NonFictionProject(
                projectListID=data.projectListID,
            )
        case ProjectType.thesis:
            return ThesisProject(projectListID=data.projectListID, type=ProjectType.thesis)
        case ProjectType.research:
            return ThesisProject(projectListID=data.projectListID, type=ProjectType.research)
        case ProjectType.poetry:
            return PoetryProject(
                projectListID=data.projectListID, type=ProjectType.poetry
            )
        case _:
            return BaseProject(
                projectListID=data.projectListID, type=ProjectType.illustrated
            )

def project_schema_factory(
    project,
    world=None,
    world_elements=None,
    characters=None,
    plots_with_steps: List[PlotSchemaWithSteps] = None,
) -> BaseProjectSchema:
    # Construir `general` desde los atributos comunes
    general = General(
        title=project.title,
        subtitle=project.subtitle,
        author=project.author,
        series=getattr(project, "series", None),
        volume=getattr(project, "volume", 1),
        genre=getattr(project, "genre", None),
        license=getattr(project, "license", None),
        situation=getattr(project, "situation", None),
        resumePhrase=getattr(project, "resume_phrase", None),
        resumeParagraph=getattr(project, "resume_paragraph", None),
        resumePage=getattr(project, "resume_page", None),
    )

    world_elements_schema = []

    if world_elements:
        for element in world_elements:
            world_elements_schema.append(
                WorldElementDetailedSchema(
                    id=element.id,
                    name=element.name,
                    description=element.description,
                    origin=element.origin,
                    conflictCause=element.conflictCause,
                    worldElementID=element.worldElementID,
                    worldID=element.worldID,
                )
            )

    world_schema = None
    if world:
        world_schema = WorldWithElementsSchema(
            id=world.id,
            world_elements=world_elements_schema,
        )

    characters_schema = []
    if characters:
        characters_schema = [
            CharacterSchema.model_validate(char) for char in characters
        ]

    sections = Sections(
        wordGoal=project.word_goal,
        words=project.words,
        general=general,
        world=world_schema,
        characters=characters_schema,
        plots=plots_with_steps,
    )
    print(project.type, "sent type")
    base_kwargs = {
        "id": project.id,
        "projectListID": project.projectListID,
        "projectName": project.project_name,
        "type": project.type,
        "sections": sections,
    }
    return BaseProjectSchema(**base_kwargs)
