from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from modules.database.database import Database
from modules.service_layer.unit_of_work import AbstractUnitOfWork
from services.scheduling.adapter.repositories.appointment import AppointmentRepository
from services.scheduling.adapter.repositories.internal_user_time_slot_inventory import (
    InternalUserTimeSlotInventoryRepository,
)
from services.scheduling.adapter.repositories.room_time_slot_inventory import (
    RoomTimeSlotInventoryRepository,
)
from services.scheduling.adapter.repositories.schedule import ScheduleRepository


class SqlAlchemyUnitOfWork(AbstractUnitOfWork):
    def __init__(self, database: Database):
        self._database = database

    async def __aenter__(self) -> SqlAlchemyUnitOfWork:
        async_session = self._database.get_async_session()
        async with async_session() as session:
            self.session: AsyncSession = session
            self.internal_user_time_slot_inventory_repository = (
                InternalUserTimeSlotInventoryRepository(session)
            )
            self.room_time_slot_inventory_repository = RoomTimeSlotInventoryRepository(
                session
            )
            self.appointment_repository = AppointmentRepository(session)
            self.schedule_repository = ScheduleRepository(session)
            await super().__aenter__()
            return self

    async def __aexit__(self, *args):
        await super().__aexit__(*args)
        await self.session.close()

    async def _commit(self):
        await self.session.commit()

    async def rollback(self):
        await self.session.rollback()
