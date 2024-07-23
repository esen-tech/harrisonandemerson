from datetime import timedelta
from typing import List

from fastapi import APIRouter, Depends, Query
from modules.domain.types import DateTime, Reference
from modules.service_layer.message_bus import MessageBus
from modules.web_server.schemas.server import ResponseSchema, StatusEnum
from services.scheduling.domain.models.time_slot import TimeSlot
from services.scheduling.domain.views import (
    time_slot_inventory as time_slot_inventory_views,
)
from services.scheduling.web_server.dependencies.message_bus import get_message_bus
from services.scheduling.web_server.schemas.time_slot_inventory import (
    RetrieveInternalUserTimeSlotInventorySummarySchema,
)

router = APIRouter()


@router.get(
    "/organizations/{organization_reference}/internal_user_time_slot_inventories/available",
    tags=["time_slot_inventory"],
    response_model=ResponseSchema[
        List[RetrieveInternalUserTimeSlotInventorySummarySchema]
    ],
)
async def get_available_internal_user_time_slot_inventories(
    organization_reference: Reference,
    internal_user_references: List[Reference] = Query(default=None),
    start_time: DateTime = Query(default=None),
    end_time: DateTime = Query(default=None),
    bus: MessageBus = Depends(get_message_bus),
):
    end_time = min(end_time, start_time + timedelta(days=31))
    async for data in time_slot_inventory_views.get_available_internal_user_time_slot_inventories_by(
        bus.uow,
        organization_reference=organization_reference,
        spread_time_slot=TimeSlot(start_time=start_time, end_time=end_time),
        internal_user_references=internal_user_references,
    ):
        return ResponseSchema[List[RetrieveInternalUserTimeSlotInventorySummarySchema]](
            status=StatusEnum.SUCCESS,
            data=[
                RetrieveInternalUserTimeSlotInventorySummarySchema.from_orm(iutsi)
                for iutsi in data
            ],
        )
