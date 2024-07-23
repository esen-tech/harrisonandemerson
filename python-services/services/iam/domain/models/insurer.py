from dataclasses import dataclass

from modules.domain.models.entity import Entity


@dataclass(kw_only=True)
class Insurer(Entity):
    official_key: str
    display_key: str
