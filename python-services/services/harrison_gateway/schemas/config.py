from typing import List

from pydantic import BaseModel


class ConfigSchema(BaseModel):
    ALLOW_ORIGINS: List[str]
