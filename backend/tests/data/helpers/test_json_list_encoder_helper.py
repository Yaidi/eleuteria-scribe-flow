import pytest
import json
from sqlalchemy.engine import default

from backend.app.data.helpers.json_list_encoder_helper import JSONEncodedList


@pytest.fixture
def type_decorator():
    return JSONEncodedList()


@pytest.fixture
def dialect():
    return default.DefaultDialect()


def test_process_bind_param_with_list(type_decorator, dialect):
    value = ["a", "b", "c"]
    result = type_decorator.process_bind_param(value, dialect)
    assert result == json.dumps(value)
    assert isinstance(result, str)


def test_process_bind_param_with_none_returns_empty_list_string(
    type_decorator, dialect
):
    result = type_decorator.process_bind_param(None, dialect)
    assert result == "[]"


def test_process_result_value_with_json_string(type_decorator, dialect):
    original = ["x", 1, {"k": "v"}]
    json_value = json.dumps(original)

    result = type_decorator.process_result_value(json_value, dialect)

    assert result == original
    assert isinstance(result, list)


def test_process_result_value_with_none_returns_empty_list(type_decorator, dialect):
    result = type_decorator.process_result_value(None, dialect)
    assert result == []
    assert isinstance(result, list)


def test_round_trip_bind_and_result(type_decorator, dialect):
    """Verifica que un valor convertido a BD y de regreso sea el mismo."""
    value = [{"id": 1}, {"id": 2}]
    bound = type_decorator.process_bind_param(value, dialect)
    result = type_decorator.process_result_value(bound, dialect)
    assert result == value
