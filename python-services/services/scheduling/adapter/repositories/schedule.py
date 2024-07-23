from typing import Type

from sqlalchemy.orm import joinedload
from sqlalchemy.sql import expression

from modules.adapter.repository import SqlAlchemyRepository
from services.scheduling.domain.models.schedule import Schedule
from services.scheduling.domain.models.schedule_date_schedule_time_slot import (
    ScheduleDateScheduleTimeSlot,
)


class ScheduleRepository(SqlAlchemyRepository[Schedule]):
    @property
    def _model(self) -> Type[Schedule]:
        return Schedule

    def get_enhanced_select_statement(
        self, statement: expression.select
    ) -> expression.select:
        return statement.options(
            joinedload(self._model.schedule_dates),
            joinedload(self._model.schedule_time_slots),
            joinedload(self._model.schedule_date_schedule_time_slots).options(
                joinedload(
                    ScheduleDateScheduleTimeSlot.schedule_date_schedule_time_slot_internal_users
                )
            ),
        )
