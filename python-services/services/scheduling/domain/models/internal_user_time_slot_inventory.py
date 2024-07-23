from dataclasses import dataclass

from modules.domain.models.entity import Entity
from modules.domain.types import Reference
from services.scheduling.domain.models.abstract_time_slot_inventory import (
    AbstractTimeSlotInventory,
)


@dataclass(kw_only=True)
class InternalUserTimeSlotInventory(AbstractTimeSlotInventory, Entity):
    internal_user_reference: Reference
