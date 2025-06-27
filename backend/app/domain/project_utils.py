from backend.app.data.entities.project_entities import FictionProject, NonFictionProject, BaseProject, \
    ThesisProject, PoetryProject
from backend.app.schemas.project_schemas import CreateProjectRequest, ProjectItemUnionSchema, FictionProjectSchema, \
    NonFictionProjectSchema, BaseProjectItemSchema, ThesisProjectSchema, UpdateProjectRequest, PoetryProjectSchema


def create_project_object_from_request(data: CreateProjectRequest):
    match data.type:
        case "fiction":
            return FictionProject(
                projectListID=data.projectListID,
            )
        case "non-fiction":
            return NonFictionProject(
                projectListID=data.projectListID,
            )
        case "thesis":
            return ThesisProject(
                projectListID=data.projectListID,
            )
        case "poetry":
            return PoetryProject(
                projectListID=data.projectListID,
            )
        case _:
            return BaseProject(
                projectListID=data.projectListID,
            )

def update_project_object_from_request(data: UpdateProjectRequest, project_to_update: BaseProject):

    project_to_update.projectListID = data.projectListID
    project_to_update.project_name = data.project_name
    project_to_update.title = data.title
    project_to_update.author = data.author
    project_to_update.subtitle = data.subtitle

    if isinstance(project_to_update, FictionProject):
        project_to_update.genre = data.genre
        project_to_update.license = data.license
        project_to_update.resume_phrase = data.resume_phrase
        project_to_update.resume_paragraph = data.resume_paragraph
        project_to_update.resume_page = data.resume_page
        project_to_update.series = data.series
        project_to_update.situation = data.situation
        project_to_update.volume = data.volume

    if isinstance(project_to_update, NonFictionProject):
        project_to_update.license = data.license
        project_to_update.series = data.series
        project_to_update.volume = data.volume


def project_schema_factory(project: BaseProject) -> ProjectItemUnionSchema:
    match project.type:
        case "fiction":
            return FictionProjectSchema.model_validate(project)
        case "nonfiction":
            return NonFictionProjectSchema.model_validate(project)
        case "thesis":
            return ThesisProjectSchema.model_validate(project)
        case "poetry":
            return PoetryProjectSchema.model_validate(project)
        case "base":
            return BaseProjectItemSchema.model_validate(project)
        case _:
            raise ValueError(f"Tipo de proyecto no reconocido: {project.type}")