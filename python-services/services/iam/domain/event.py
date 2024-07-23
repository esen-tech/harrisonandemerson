from dataclasses import dataclass

from modules.domain.event import Event
from modules.domain.types import Reference


@dataclass
class EndUserSignupIntentCreated(Event):
    phone_number: str | None
    email_address: str | None
    otp_value: str


@dataclass
class EndUserLoginIntentCreated(Event):
    phone_number: str | None
    email_address: str | None
    otp_value: str


@dataclass
class AirtableEndUserUpserted(Event):
    airtable_reference: str


@dataclass(kw_only=True)
class DeliveryOrderPrepared(Event):
    delivery_order_reference: Reference
    raw_recipient_end_user_full_name: str
    raw_recipient_end_user_phone_number: str
    raw_served_end_user_full_name: str
    raw_served_end_user_phone_number: str


@dataclass(kw_only=True)
class LocalDeliveryOrderRecipientEndUserCreated(Event):
    delivery_order_reference: Reference
    end_user_reference: Reference


@dataclass(kw_only=True)
class LocalDeliveryOrderServedEndUserCreated(Event):
    delivery_order_reference: Reference
    end_user_reference: Reference


@dataclass(kw_only=True)
class DeliveryOrderRecipientEndUserCreated(Event):
    delivery_order_reference: Reference
    end_user_reference: Reference


@dataclass(kw_only=True)
class DeliveryOrderServedEndUserCreated(Event):
    delivery_order_reference: Reference
    end_user_reference: Reference


@dataclass(kw_only=True)
class CareAirtableDeliveryOrderRecipientEndUserCreated(Event):
    delivery_order_reference: Reference
    end_user_reference: Reference
    care_airtable_end_user_reference: str


@dataclass(kw_only=True)
class CareAirtableDeliveryOrderServedEndUserCreated(Event):
    delivery_order_reference: Reference
    end_user_reference: Reference
    care_airtable_end_user_reference: str


ingress_events = [DeliveryOrderPrepared]
