from dataclasses import dataclass

from modules.domain.models.entity import Entity
from modules.domain.types import DateTime


@dataclass(kw_only=True)
class PromoCode(Entity):
    program_name: str
    code: str
    effective_time: DateTime
    expiration_time: DateTime
