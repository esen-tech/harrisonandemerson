from dataclasses import dataclass

from modules.domain.models.entity import Entity
from modules.domain.types import Reference


@dataclass(kw_only=True)
class ScheduleDateScheduleTimeSlotInternalUser(Entity):
    internal_user_reference: Reference
