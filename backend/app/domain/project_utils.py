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
    UpdateProjectRequest,
    General,
    Sections,
    BaseProjectSchema,
    MinimalBaseProjectSchema,
)
from backend.app.schemas.sections.world_schemas import (
    WorldWithElementsSchema,
    WorldElementDetailedSchema,
)


def update_project_type_on_response(project: BaseProject) -> MinimalBaseProjectSchema:

    base_kwargs = {
        "id": project.id,
        "projectListID": project.projectListID,
        "projectName": project.project_name,
    }
    return MinimalBaseProjectSchema(**base_kwargs)


def create_project_object_from_request(data: CreateProjectRequest):
    match data.type.lower():
        case "novel":
            return FictionProject(projectListID=data.projectListID, duration=data.type)
        case "trilogy":
            return FictionProject(projectListID=data.projectListID, duration=data.type)
        case "non-fiction":
            return NonFictionProject(
                projectListID=data.projectListID,
            )
        case "thesis":
            return ThesisProject(projectListID=data.projectListID, duration=data.type)
        case "research":
            return ThesisProject(projectListID=data.projectListID, duration=data.type)
        case "poetry":
            return PoetryProject(
                projectListID=data.projectListID,
            )
        case _:
            return BaseProject(
                projectListID=data.projectListID,
            )


def update_project(data: UpdateProjectRequest, project_to_update: BaseProject):
    project_to_update.projectListID = data.projectListID
    project_to_update.project_name = data.projectName


def project_schema_factory(
    project, world=None, world_elements=None, characters=None
) -> BaseProjectSchema:
    # Construir `general` desde los atributos comunes
    general = General(
        title=project.title,
        subtitle=project.subtitle,
        author=project.author,
        series=getattr(project, "series", None),
        volume=getattr(project, "volume", None),
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
    )

    project_type = project.type.capitalize()

    if project_type == "Fiction" or project_type == "Thesis":
        project_type = getattr(project, "duration", "")
    elif project_type == "Base":
        project_type = "Book"

    base_kwargs = {
        "id": project.id,
        "projectListID": project.projectListID,
        "projectName": project.project_name,
        "type": project_type,
        "sections": sections,
    }
    return BaseProjectSchema(**base_kwargs)
