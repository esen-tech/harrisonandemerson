from dataclasses import dataclass

from modules.domain.models.entity import Entity


@dataclass(kw_only=True)
class CareProductImage(Entity):
    src: str
    sequence: int | None
