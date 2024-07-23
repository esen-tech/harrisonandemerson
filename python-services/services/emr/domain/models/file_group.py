from dataclasses import dataclass

from modules.domain.models.entity import Entity


@dataclass(kw_only=True)
class FileGroup(Entity):
    display_name: str
