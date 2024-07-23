from dataclasses import dataclass

from modules.domain.command import Command
from modules.domain.types import Reference
from services.scheduling.web_server.schemas.appointment import (
    CreateAppointmentByEndUserSchema,
    CreateAppointmentByInternalUserSchema,
    UpdateAppointmentByEndUserSchema,
    UpdateAppointmentByInternalUserSchema,
)
from services.scheduling.web_server.schemas.schedule import (
    CreateSchedulByInternalUserSchema,
    UpdateScheduleByInternalUserSchema,
)


@dataclass
class CreateSchedulByInternalUser(Command):
    organization_reference: Reference
    payload: CreateSchedulByInternalUserSchema


@dataclass
class UpdateScheduleByInternalUser(Command):
    schedule_reference: Reference
    payload: UpdateScheduleByInternalUserSchema


@dataclass
class PublishScheduleByInternalUser(Command):
    schedule_reference: Reference


@dataclass
class CreateAppointmentByInternalUser(Command):
    organization_reference: Reference
    service_product_dict: dict
    payload: CreateAppointmentByInternalUserSchema


@dataclass
class CreateAppointmentByEndUser(Command):
    end_user_reference: Reference
    service_product_dict: dict
    payload: CreateAppointmentByEndUserSchema


@dataclass
class RescheduleAppointmentByInternalUser(Command):
    appointment_reference: Reference
    service_product_dict: dict
    payload: UpdateAppointmentByInternalUserSchema


@dataclass
class RescheduleAppointmentByEndUser(Command):
    appointment_reference: Reference
    end_user_reference: Reference
    service_product_dict: dict
    payload: UpdateAppointmentByEndUserSchema


@dataclass
class CancelAppointmentByInternalUser(Command):
    appointment_reference: Reference


@dataclass
class CancelAppointmentByEndUser(Command):
    end_user_reference: Reference
    appointment_reference: Reference
