from dataclasses import dataclass, field
from enum import Enum
from typing import List

from modules.domain.models.entity import Entity
from modules.domain.types import DateTime, Reference
from services.scheduling.domain.models.internal_user_appointment_time_slot import (
    InternalUserAppointmentTimeSlot,
)
from services.scheduling.domain.models.room_appointment_time_slot import (
    RoomAppointmentTimeSlot,
)
from services.scheduling.domain.models.time_slot import TimeSlot


@dataclass(kw_only=True)
class Appointment(Entity):
    class StateEnum(Enum):
        SCHEDULED = "scheduled"
        CANCELLED = "cancelled"
        ABSENT = "absent"
        COMPLETED = "completed"

    organization_reference: Reference
    service_product_reference: Reference
    end_user_reference: Reference
    principal_name: str | None = None
    principal_phone_number: str | None = None
    state: StateEnum
    cooperation_code_code: str | None = None
    airtable_reference: str | None = None
    internal_user_appointment_time_slots: List[InternalUserAppointmentTimeSlot]
    room_appointment_time_slots: List[RoomAppointmentTimeSlot]

    _evaluated_time_slot_start_time: DateTime = field(init=False, repr=False)
    _evaluated_time_slot_end_time: DateTime = field(init=False, repr=False)

    @property
    def evaluated_time_slot(self) -> TimeSlot:
        return TimeSlot(
            start_time=self._evaluated_time_slot_start_time,
            end_time=self._evaluated_time_slot_end_time,
        )

    @evaluated_time_slot.setter
    def evaluated_time_slot(self, time_slot: TimeSlot):
        self._evaluated_time_slot_start_time = time_slot.start_time
        self._evaluated_time_slot_end_time = time_slot.end_time

    def schedule(self):
        for iuats in self.internal_user_appointment_time_slots:
            iuats.allocated_inventory = 1
        self.state = Appointment.StateEnum.SCHEDULED.value

    def complete(self):
        for iuats in self.internal_user_appointment_time_slots:
            iuats.allocated_inventory = 1
        self.state = Appointment.StateEnum.COMPLETED.value

    def absent(self):
        for iuats in self.internal_user_appointment_time_slots:
            iuats.allocated_inventory = 0
        self.state = Appointment.StateEnum.ABSENT.value

    def cancel(self):
        for iuats in self.internal_user_appointment_time_slots:
            iuats.allocated_inventory = 0
        self.state = Appointment.StateEnum.CANCELLED.value
