from typing import Type

from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from sqlalchemy.sql import expression

from modules.adapter.repository import SqlAlchemyRepository
from services.scheduling.domain.models.appointment import Appointment


class AppointmentRepository(SqlAlchemyRepository[Appointment]):
    @property
    def _model(self) -> Type[Appointment]:
        return Appointment

    def get_enhanced_select_statement(
        self, statement: expression.select
    ) -> expression.select:
        return statement.options(
            joinedload(Appointment.internal_user_appointment_time_slots),
            joinedload(Appointment.room_appointment_time_slots),
        )

    async def _get_by(self, **kwargs) -> Appointment:
        statement = (
            select(self._model)
            .filter_by(**kwargs)
            .options(
                joinedload(Appointment.internal_user_appointment_time_slots),
                joinedload(Appointment.room_appointment_time_slots),
            )
        )
        result = await self._session.execute(statement)
        entity = result.scalars().first()
        return entity
