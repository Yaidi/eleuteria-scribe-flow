from backend.app.data.entities.project_entities import FictionProject, NonFictionProject, BaseProject, \
    ThesisProject
from backend.app.schemas.project_schemas import CreateProjectRequest, ProjectItemUnionSchema, FictionProjectSchema, \
    NonFictionProjectSchema, BaseProjectItemSchema, ThesisProjectSchema


def create_project_object_from_request(data: CreateProjectRequest):
    match data.type:
        case "fiction":
            return FictionProject(
                projectListID=data.projectListID,
            )
        case "nonfiction":
            return NonFictionProject(
                projectListID=data.projectListID,
            )
        case "thesis":
            return ThesisProject(
                projectListID=data.projectListID,
            )
        case _:
            return BaseProject(
                projectListID=data.projectListID,
            )


def project_schema_factory(project: BaseProject) -> ProjectItemUnionSchema:
    match project.type:
        case "fiction":
            return FictionProjectSchema.model_validate(project)
        case "nonfiction":
            return NonFictionProjectSchema.model_validate(project)
        case "thesis":
            return ThesisProjectSchema.model_validate(project)
        case "base":
            return BaseProjectItemSchema.model_validate(project)
        case _:
            raise ValueError(f"Tipo de proyecto no reconocido: {project.type}")