from dataclasses import dataclass

from modules.domain.models.entity import Entity
from modules.domain.types import Time


@dataclass(kw_only=True)
class ScheduleTimeSlot(Entity):
    name: str
    start_time: Time
    end_time: Time
    weekday_indices: str
