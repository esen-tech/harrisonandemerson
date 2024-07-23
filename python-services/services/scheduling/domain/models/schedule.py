from dataclasses import dataclass
from typing import List

from modules.domain.models.entity import Entity
from modules.domain.types import Date, DateTime, Reference
from services.scheduling.domain.models.schedule_date import ScheduleDate
from services.scheduling.domain.models.schedule_date_schedule_time_slot import (
    ScheduleDateScheduleTimeSlot,
)
from services.scheduling.domain.models.schedule_time_slot import ScheduleTimeSlot


@dataclass(kw_only=True)
class Schedule(Entity):
    organization_reference: Reference
    name: str
    min_date: Date
    max_date: Date
    timezone_offset_in_minutes: int
    last_publish_time: DateTime | None = None
    schedule_dates: List[ScheduleDate]
    schedule_time_slots: List[ScheduleTimeSlot]
    schedule_date_schedule_time_slots: List[ScheduleDateScheduleTimeSlot]
