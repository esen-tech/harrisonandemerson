from dataclasses import dataclass

from modules.domain.models.entity import Entity
from modules.domain.types import Reference
from services.scheduling.domain.models.abstract_appointment_time_slot import (
    AbstractAppointmentTimeSlot,
)


@dataclass(kw_only=True)
class InternalUserAppointmentTimeSlot(AbstractAppointmentTimeSlot, Entity):
    internal_user_time_slot_inventory_reference: Reference
    internal_user_reference: Reference
