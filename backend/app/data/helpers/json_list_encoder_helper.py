import json

from sqlalchemy.sql.sqltypes import Text
from sqlalchemy.sql.type_api import TypeDecorator


class JSONEncodedList(TypeDecorator):
    impl = Text

    def process_bind_param(self, value, dialect):
        if value is not None:
            return json.dumps(value)
        return "[]"

    def process_result_value(self, value, dialect):
        if value is not None:
            return json.loads(value)
        return []
