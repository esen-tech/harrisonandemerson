from typing import List, Type

from modules.adapter.repository import SqlAlchemyRepository
from modules.domain.types import Reference
from services.scheduling.domain.models.internal_user_time_slot_inventory import (
    InternalUserTimeSlotInventory,
)
from services.scheduling.domain.models.time_slot import TimeSlot
from sqlalchemy.future import select


class InternalUserTimeSlotInventoryRepository(
    SqlAlchemyRepository[InternalUserTimeSlotInventory]
):
    @property
    def _model(self) -> Type[InternalUserTimeSlotInventory]:
        return InternalUserTimeSlotInventory

    async def get_all_by_organization_reference_and_spread_time_slot_and_internal_user_references(
        self,
        organization_reference: Reference,
        spread_time_slot: TimeSlot,
        internal_user_references: List[Reference],
    ) -> List[InternalUserTimeSlotInventory]:
        statement = select(InternalUserTimeSlotInventory).where(
            InternalUserTimeSlotInventory.organization_reference
            == organization_reference,
            spread_time_slot.start_time
            <= InternalUserTimeSlotInventory._time_slot_start_time,
            InternalUserTimeSlotInventory._time_slot_end_time
            <= spread_time_slot.end_time,
            InternalUserTimeSlotInventory.internal_user_reference.in_(
                internal_user_references
            ),
        )
        result = await self._session.execute(statement)
        entities = result.scalars().unique().all()
        return entities

    async def get_all_available_by_organization_reference_and_spread_time_slot_and_internal_user_references(
        self,
        organization_reference: Reference,
        spread_time_slot: TimeSlot,
        internal_user_references: List[Reference],
    ) -> List[InternalUserTimeSlotInventory]:
        statement = select(InternalUserTimeSlotInventory).where(
            InternalUserTimeSlotInventory.organization_reference
            == organization_reference,
            spread_time_slot.start_time
            <= InternalUserTimeSlotInventory._time_slot_start_time,
            InternalUserTimeSlotInventory._time_slot_end_time
            <= spread_time_slot.end_time,
            InternalUserTimeSlotInventory.internal_user_reference.in_(
                internal_user_references
            ),
            InternalUserTimeSlotInventory.total_allocated
            < InternalUserTimeSlotInventory.total_inventory,
        )
        result = await self._session.execute(statement)
        entities = result.scalars().unique().all()
        return entities

    async def get_all_by_references(
        self, references: List[Reference]
    ) -> List[InternalUserTimeSlotInventory]:
        statement = select(InternalUserTimeSlotInventory).where(
            InternalUserTimeSlotInventory.reference.in_(references)
        )
        result = await self._session.execute(statement)
        entities = result.scalars().unique().all()
        return entities
