from pydantic import BaseModel
from typing import Optional


class WordStatsUpdate(BaseModel):
    wordGoal: Optional[int] = None
    words: Optional[int] = None
