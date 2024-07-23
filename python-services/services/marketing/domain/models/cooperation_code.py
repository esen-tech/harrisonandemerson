from dataclasses import dataclass

from modules.domain.models.entity import Entity
from modules.domain.types import DateTime


@dataclass(kw_only=True)
class CooperationCode(Entity):
    code: str
    expiration_time: DateTime
    entity_name: str
    operation_remark: str | None = None
