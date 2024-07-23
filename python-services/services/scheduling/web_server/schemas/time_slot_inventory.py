from modules.domain.types import Reference
from modules.web_server.schemas.base import BaseRetrieveEntitySchema
from services.scheduling.domain.models.time_slot import TimeSlot


class RetrieveInternalUserTimeSlotInventorySummarySchema(BaseRetrieveEntitySchema):
    time_slot: TimeSlot
    internal_user_reference: Reference
