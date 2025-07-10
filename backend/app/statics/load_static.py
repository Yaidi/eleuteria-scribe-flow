from pathlib import Path
import sys
import json


def get_resource_path(relative_path: str) -> Path:
    if getattr(sys, "frozen", False):
        return Path(sys._MEIPASS) / relative_path
    else:
        # Parte desde el backend/ en desarrollo
        return Path(__file__).parent.parent.parent / relative_path


def load_static_content():
    path = get_resource_path("app/statics/project_templates.json")
    with open(path, encoding="utf-8") as f:
        return json.load(f)
