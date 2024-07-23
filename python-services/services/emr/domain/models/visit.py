from dataclasses import dataclass

from modules.domain.models.entity import Entity
from modules.domain.types import DateTime, Reference


@dataclass(kw_only=True)
class Visit(Entity):
    organization_reference: Reference
    end_user_reference: Reference
    appointment_reference: Reference | None = None
    start_time: DateTime
