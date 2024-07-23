from dataclasses import dataclass, field

from modules.domain.types import DateTime, Reference
from services.scheduling.domain.models.time_slot import TimeSlot


class InvalidInventoryCount(Exception):
    pass


@dataclass(kw_only=True)
class AbstractTimeSlotInventory:
    organization_reference: Reference
    total_inventory: int = 0
    total_allocated: int = 0
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

    def warehouse(self, inventory_count: int):
        self.total_inventory += inventory_count

    def deduct(self, inventory_count: int):
        if inventory_count > self.total_inventory:
            raise InvalidInventoryCount()
        self.total_inventory -= inventory_count

    def allocate(self, inventory_count: int):
        self.total_allocated += inventory_count

    def deallocate(self, inventory_count: int):
        self.total_allocated -= inventory_count
