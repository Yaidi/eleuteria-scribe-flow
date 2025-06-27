from backend.app.data.entities.project_entities import FictionProject, NonFictionProject, TesisProject, BaseProject
from backend.app.schemas.project_schemas import CreateProjectRequest, ProjectItemUnionSchema, FictionProjectSchema, \
    NonFictionProjectSchema, TesisProjectSchema, BaseProjectItemSchema


def create_project_object_from_request(data: CreateProjectRequest):
    match data.type:
        case "fiction":
            return FictionProject(
                projectListID=data.projectListID,
                title=data.title,
                subtitle=data.subtitle,
                author=data.author,
                type=data.type,
                series= data.series,
                volume= data.volume,
                genre= data.genre,
                license= data.license,
                situation= data.situation,
                resume_phrase= data.resume_phrase,
                resume_paragraph= data.resume_paragraph,
                resume_page= data.resume_page,
            )
        case "nonfiction":
            return NonFictionProject(
                projectListID=data.projectListID,
                title=data.title,
                subtitle=data.subtitle,
                author=data.author,
                type=data.type,
                volume=data.volume,
                series=data.series,
                license=data.license,
            )
        case "tesis":
            return TesisProject(
                projectListID=data.projectListID,
                title=data.title,
                subtitle=data.subtitle,
                author=data.author,
                type=data.type
            )
        case _:
            return BaseProject(
                projectListID=data.projectListID,
                title=data.title,
                subtitle=data.subtitle,
                author=data.author,
                type=data.type
            )


def project_schema_factory(project: BaseProject) -> ProjectItemUnionSchema:
    match project.type:
        case "fiction":
            return FictionProjectSchema.model_validate(project)
        case "nonfiction":
            return NonFictionProjectSchema.model_validate(project)
        case "tesis":
            return TesisProjectSchema.model_validate(project)
        case "base":
            return BaseProjectItemSchema.model_validate(project)
        case _:
            raise ValueError(f"Tipo de proyecto no reconocido: {project.type}")