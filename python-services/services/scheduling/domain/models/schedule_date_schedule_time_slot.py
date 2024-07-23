from dataclasses import dataclass
from typing import List

from modules.domain.models.entity import Entity
from modules.domain.types import Reference, Time
from services.scheduling.domain.models.schedule_date_schedule_time_slot_internal_user import (
    ScheduleDateScheduleTimeSlotInternalUser,
)


@dataclass(kw_only=True)
class ScheduleDateScheduleTimeSlot(Entity):
    schedule_date_reference: Reference
    schedule_time_slot_reference: Reference
    override_schedule_time_slot_start_time: Time
    override_schedule_time_slot_end_time: Time
    schedule_date_schedule_time_slot_internal_users: List[
        ScheduleDateScheduleTimeSlotInternalUser
    ]
