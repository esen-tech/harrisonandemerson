from dataclasses import dataclass, field

from modules.domain.models.entity import Entity
from modules.domain.types import DateTime, Reference
from services.scheduling.domain.models.time_slot import TimeSlot


@dataclass(kw_only=True)
class AbstractAppointmentTimeSlot(Entity):
    appointment_reference: Reference | None = None
    allocated_inventory: int

    _time_slot_start_time: DateTime = field(init=False, repr=False)
    _time_slot_end_time: DateTime = field(init=False, repr=False)

    @property
    def time_slot(self) -> TimeSlot:
        return TimeSlot(
            start_time=self._time_slot_start_time, end_time=self._time_slot_end_time
        )

    @time_slot.setter
    def time_slot(self, time_slot: TimeSlot):
        self._time_slot_start_time = time_slot.start_time
        self._time_slot_end_time = time_slot.end_time
