from enum import Enum

from modules.domain.types import cast_string_to_datetime
from modules.domain.views.filter_view_enhancer import (
    FilterContextSchema,
    FilterViewEnhancer,
)
from services.scheduling.domain.models.appointment import Appointment


class AppointmentFilterEnum(Enum):
    START_TIME_AND_END_TIME_AND_END_USER_REFERENCES_AND_STATE = (
        "START_TIME_AND_END_TIME_AND_END_USER_REFERENCES_AND_STATE"
    )
    END_USER_REFERENCE = "END_USER_REFERENCE"
    CONTAIN_ANY_STATES = "CONTAIN_ANY_STATES"


appointment_filter_view_enhancer = FilterViewEnhancer(AppointmentFilterEnum)


@appointment_filter_view_enhancer.handler(
    AppointmentFilterEnum.START_TIME_AND_END_TIME_AND_END_USER_REFERENCES_AND_STATE
)
def handle_time_slot_and_state_filter(statement, filter_context: FilterContextSchema):
    if filter_context.query.get("start_time") is not None:
        statement = statement.where(
            Appointment._evaluated_time_slot_start_time
            >= cast_string_to_datetime(filter_context.query["start_time"])
        )
    if filter_context.query.get("end_time") is not None:
        statement = statement.where(
            Appointment._evaluated_time_slot_end_time
            < cast_string_to_datetime(filter_context.query["end_time"])
        )
    if filter_context.query.get("end_user_references") is not None:
        statement = statement.where(
            Appointment.end_user_reference.in_(
                filter_context.query["end_user_references"]
            )
        )
    if filter_context.query.get("state") is not None:
        statement = statement.where(Appointment.state == filter_context.query["state"])
    return statement


@appointment_filter_view_enhancer.handler(AppointmentFilterEnum.END_USER_REFERENCE)
def handle_end_user_reference_filter(statement, filter_context: FilterContextSchema):
    return statement.where(Appointment.end_user_reference == filter_context.query)


@appointment_filter_view_enhancer.handler(AppointmentFilterEnum.CONTAIN_ANY_STATES)
def handle_contain_any_states_filter(statement, filter_context: FilterContextSchema):
    return statement.where(Appointment.state.in_(filter_context.query))
