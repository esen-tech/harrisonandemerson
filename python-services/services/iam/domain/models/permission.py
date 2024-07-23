from dataclasses import dataclass

from modules.domain.models.entity import Entity
from modules.domain.types import Comparable


@dataclass(kw_only=True)
class Permission(Entity):
    identifier_key: str
    display_sequence: Comparable
