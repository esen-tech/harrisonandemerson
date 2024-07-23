from dataclasses import dataclass

from modules.domain.event import Event
from modules.domain.types import Reference


@dataclass(kw_only=True)
class AppointmentCreated(Event):
    appointment_reference: Reference


@dataclass(kw_only=True)
class AppointmentRescheduled(Event):
    appointment_reference: Reference


@dataclass(kw_only=True)
class AppointmentCancelled(Event):
    appointment_reference: Reference


@dataclass(kw_only=True)
class AirtableSchedulesUpdated(Event):
    pass


@dataclass(kw_only=True)
class AirtableVisitUpserted(Event):
    airtable_reference: str
