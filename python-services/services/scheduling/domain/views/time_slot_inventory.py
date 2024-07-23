from typing import AsyncIterator, List

from modules.domain.types import Reference
from services.scheduling.domain.models.internal_user_time_slot_inventory import (
    InternalUserTimeSlotInventory,
)
from services.scheduling.domain.models.time_slot import TimeSlot
from services.scheduling.service_layer.unit_of_work import SqlAlchemyUnitOfWork


async def get_available_internal_user_time_slot_inventories_by(
    uow: SqlAlchemyUnitOfWork,
    organization_reference: Reference,
    spread_time_slot: TimeSlot,
    internal_user_references: List[Reference],
) -> AsyncIterator[List[InternalUserTimeSlotInventory]]:
    async with uow:
        internal_user_time_slot_inventories = await uow.internal_user_time_slot_inventory_repository.get_all_available_by_organization_reference_and_spread_time_slot_and_internal_user_references(
            organization_reference=organization_reference,
            spread_time_slot=spread_time_slot,
            internal_user_references=internal_user_references,
        )
        yield internal_user_time_slot_inventories
