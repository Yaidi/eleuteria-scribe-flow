import json

def load_static_content(file: str):
    with open(file, "r", encoding="utf-8") as f:
        return json.load(f)
