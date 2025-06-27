from backend.app.data.entities.project_entities import FictionProject, NonFictionProject, BaseProject, \
    ThesisProject, PoetryProject
from backend.app.schemas.project_schemas import CreateProjectRequest, ProjectItemUnionSchema, FictionProjectSchema, \
    NonFictionProjectSchema, BaseProjectItemSchema, ThesisProjectSchema, UpdateProjectRequest, PoetryProjectSchema, \
    General, Sections


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
    project_to_update.title = data.sections.general.title
    project_to_update.author = data.sections.general.author
    project_to_update.subtitle = data.sections.general.subtitle
    project_to_update.words = data.sections.words
    project_to_update.word_goal = data.sections.word_goal

    if isinstance(project_to_update, FictionProject):
        project_to_update.genre = data.sections.general.genre
        project_to_update.license = data.sections.general.license
        project_to_update.resume_phrase = data.sections.general.resume_phrase
        project_to_update.resume_paragraph = data.sections.general.resume_paragraph
        project_to_update.resume_page = data.sections.general.resume_page
        project_to_update.series = data.sections.general.series
        project_to_update.situation = data.sections.general.situation
        project_to_update.volume = data.sections.general.volume

    if isinstance(project_to_update, NonFictionProject):
        project_to_update.license = data.sections.general.license
        project_to_update.series = data.sections.general.series
        project_to_update.volume = data.sections.general.volume


def project_schema_factory(project) -> ProjectItemUnionSchema:
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
        resume_phrase=getattr(project, "resume_phrase", None),
        resume_paragraph=getattr(project, "resume_paragraph", None),
        resume_page=getattr(project, "resume_page", None),
    )

    sections = Sections(
        word_goal=project.word_goal,
        words=project.words,
        general=general
    )

    base_kwargs = {
        "id": project.id,
        "projectListID": project.projectListID,
        "project_name": project.project_name,
        "type": project.type,
        "sections": sections
    }

    if isinstance(project, FictionProject):
        return FictionProjectSchema(**base_kwargs)
    elif isinstance(project, NonFictionProject):
        return NonFictionProjectSchema(**base_kwargs)
    elif isinstance(project, ThesisProject):
        return ThesisProjectSchema(**base_kwargs)
    elif project.type == "poetry":
        return PoetryProjectSchema(**base_kwargs)
    else:
        return BaseProjectItemSchema(**base_kwargs)