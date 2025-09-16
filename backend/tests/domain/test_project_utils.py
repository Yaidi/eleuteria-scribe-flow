from datetime import datetime, timezone

import pytest

from backend.app.data.entities.project_entities import BaseProject, FictionProject
from backend.app.domain.project_utils import project_on_response_list, create_project_object_from_request, \
    project_schema_factory
from backend.app.schemas.project_schemas import (
    CreateProjectRequest,
    ProjectType,
    ProjectResponseList,
    BaseProjectSchema,
    General,
)
from backend.app.schemas.sections.plot_schemas import PlotSchemaWithSteps
from backend.app.schemas.sections.character_schemas import CharacterSchema
from backend.app.schemas.sections.world_schemas import WorldElementDetailedSchema

def create_base_project():
    return BaseProject(
        id = 1,
        projectListID = 1,
        project_name = "dummy",
        type = ProjectType.novel,
        word_goal = 1000,
        words = 0,
        status = "done",
        description="desc",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )

def test_project_on_response_list_maps_fields():
    proj = create_base_project()
    result = project_on_response_list(proj)
    assert isinstance(result, ProjectResponseList)
    assert result.id == proj.id
    assert result.projectListID == proj.projectListID
    assert result.projectName == proj.project_name
    assert result.type == ProjectType.novel
    assert result.wordGoal == proj.word_goal
    assert result.words == proj.words
    assert result.status == proj.status
    assert result.description == proj.description
    assert result.created == proj.created_at
    assert result.updated == proj.updated_at


@pytest.mark.parametrize(
    "ptype,expected_class",
    [
        (ProjectType.novel, "FictionProject"),
        (ProjectType.non_fiction, "NonFictionProject"),
        (ProjectType.thesis, "ThesisProject"),
        (ProjectType.research, "ThesisProject"),
        (ProjectType.poetry, "PoetryProject"),
        ("other", "FictionProject"),
    ],
)
def test_create_project_object_from_request(ptype, expected_class):
    data = CreateProjectRequest(
        projectListID=1,
        type=ptype if isinstance(ptype, ProjectType) else ProjectType.illustrated,
    )
    if ptype == "other":
        data = CreateProjectRequest(projectListID=1, type=ProjectType.novel)
    obj = create_project_object_from_request(data)
    assert obj.__class__.__name__ == expected_class
    assert obj.projectListID == 1


def test_project_schema_factory_minimal():
    proj = create_base_project()
    schema = project_schema_factory(proj)
    assert isinstance(schema, BaseProjectSchema)
    assert schema.id == proj.id
    assert isinstance(schema.sections.general, General)
    assert schema.sections.world is None
    assert schema.sections.characters == []
    assert schema.sections.plots is None


def test_project_schema_factory_with_world_and_elements():
    proj = create_base_project()
    world = type("World", (), {"id": 1})
    element = type(
        "Element",
        (),
        {
            "id": 1,
            "name": "earth",
            "description": "desc",
            "origin": "origin",
            "conflictCause": "war",
            "parentId": None,
            "worldId": 1,
        },
    )
    schema = project_schema_factory(proj, world=world, world_elements=[element])
    assert schema.sections.world.id == 1
    assert isinstance(schema.sections.world.worldElements[0], WorldElementDetailedSchema)


def test_project_schema_factory_with_characters_and_plots():
    proj = create_base_project()
    char = {"id": 1, "projectID": 1, "name": "hero"}
    plot = PlotSchemaWithSteps(id=1, projectID=1, title="plot", plotSteps=[])
    schema = project_schema_factory(proj, characters=[char], plots_with_steps=[plot])
    assert isinstance(schema.sections.characters[0], CharacterSchema)
    assert schema.sections.plots[0].id == 1
