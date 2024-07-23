from typing import List, Type

from modules.adapter.repository import SqlAlchemyRepository
from modules.domain.types import DateTime, Reference
from services.scheduling.domain.models.room_time_slot_inventory import (
    RoomTimeSlotInventory,
)
from services.scheduling.domain.models.time_slot import TimeSlot
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload


class RoomTimeSlotInventoryRepository(SqlAlchemyRepository[RoomTimeSlotInventory]):
    @property
    def _model(self) -> Type[RoomTimeSlotInventory]:
        return RoomTimeSlotInventory

    async def get_all_by_organization_reference_and_time_range_and_internal_user_references(
        self,
        organization_reference: Reference,
        start_time: DateTime,
        end_time: DateTime,
        room_references: List[Reference],
    ) -> List[RoomTimeSlotInventory]:
        statement = (
            select(RoomTimeSlotInventory)
            .join(RoomTimeSlotInventory.time_slot)
            .options(joinedload(RoomTimeSlotInventory.time_slot))
            .where(
                TimeSlot.organization_reference == organization_reference,
                start_time <= TimeSlot.start_time,
                TimeSlot.end_time <= end_time,
                RoomTimeSlotInventory.room_reference.in_(room_references),
                RoomTimeSlotInventory.total_allocated
                < RoomTimeSlotInventory.total_inventory,
            )
        )
        result = await self._session.execute(statement)
        entities = result.scalars().unique().all()
        return entities

    async def get_all_between_start_time_and_end_time(
        self,
        start_time: DateTime,
        end_time: DateTime,
    ) -> List[RoomTimeSlotInventory]:
        statement = (
            select(self._model)
            .join(self._model.time_slot)
            .options(joinedload(self._model.time_slot))
            .where(
                start_time <= TimeSlot.start_time,
                TimeSlot.end_time <= end_time,
            )
        )
        result = await self._session.execute(statement)
        entities = result.scalars().unique().all()
        return entities
