import uuid
from dataclasses import dataclass, field

from modules.domain.types import DataAlias, DateTime, Reference


@dataclass(kw_only=True)
class Entity:
    reference: Reference = field(default_factory=uuid.uuid4)
    create_time: DateTime = field(init=False)
    update_time: DateTime = field(init=False)
    data_alias: DataAlias | None = None
