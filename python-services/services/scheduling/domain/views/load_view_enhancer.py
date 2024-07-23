from enum import Enum

from modules.domain.views.load_view_enhancer import LoadContextSchema, LoadViewEnhancer
from services.scheduling.domain.models.appointment import Appointment
from sqlalchemy.orm import joinedload


class SchedulingLoadEnum(Enum):
    APPOINTMENT = "APPOINTMENT"


scheduling_load_view_enhancer = LoadViewEnhancer(SchedulingLoadEnum)


@scheduling_load_view_enhancer.handler(SchedulingLoadEnum.APPOINTMENT)
def handle_loading_appointment(statement, _load_context: LoadContextSchema):
    return statement.options(
        joinedload(Appointment.internal_user_appointment_time_slots),
        joinedload(Appointment.room_appointment_time_slots),
    )
