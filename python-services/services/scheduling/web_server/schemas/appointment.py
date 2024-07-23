from typing import List

from modules.domain.types import DateTime, Reference
from modules.web_server.schemas.base import (
    BaseCreateEntitySchema,
    BaseRetrieveEntitySchema,
    BaseUpdateEntitySchema,
)
from services.scheduling.domain.models.appointment import Appointment
from services.scheduling.domain.models.time_slot import TimeSlot


class CreateAppointmentByInternalUserSchema(BaseCreateEntitySchema):
    reference: Reference
    end_user_reference: Reference
    service_product_reference: Reference
    internal_user_references: List[Reference]
    start_time: DateTime


class CreateAppointmentByEndUserSchema(BaseCreateEntitySchema):
    reference: Reference
    organization_reference: Reference
    principal_name: str | None = None
    principal_phone_number: str | None = None
    service_product_reference: Reference
    internal_user_references: List[Reference]
    start_time: DateTime
    cooperation_code_code: str | None


class RetrieveAppointmentSummarySchema(BaseRetrieveEntitySchema):
    class _RetrieveInternalUserAppointmentTimeSlot(BaseRetrieveEntitySchema):
        internal_user_reference: Reference

    class _RetrieveRoomAppointmentTimeSlot(BaseRetrieveEntitySchema):
        room_reference: Reference

    organization_reference: Reference
    end_user_reference: Reference
    service_product_reference: Reference
    evaluated_time_slot: TimeSlot
    state: Appointment.StateEnum
    internal_user_appointment_time_slots: List[_RetrieveInternalUserAppointmentTimeSlot]
    room_appointment_time_slots: List[_RetrieveRoomAppointmentTimeSlot]


class RetrieveAppointmentDetailSchema(RetrieveAppointmentSummarySchema):
    principal_name: str | None = None
    principal_phone_number: str | None = None
    cooperation_code_code: str | None


class UpdateAppointmentByInternalUserSchema(BaseUpdateEntitySchema):
    end_user_reference: Reference
    service_product_reference: Reference
    internal_user_references: List[Reference]
    start_time: DateTime


class UpdateAppointmentByEndUserSchema(BaseUpdateEntitySchema):
    organization_reference: Reference
    principal_name: str | None = None
    principal_phone_number: str | None = None
    service_product_reference: Reference
    internal_user_references: List[Reference]
    start_time: DateTime
    cooperation_code_code: str | None
