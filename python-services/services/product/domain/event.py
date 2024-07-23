from dataclasses import dataclass

from modules.domain.event import Event
from modules.domain.types import Reference


@dataclass(kw_only=True)
class LocalFinancialOrderCreated(Event):
    financial_order_reference: Reference


@dataclass(kw_only=True)
class FinancialOrderCreated(Event):
    financial_order_reference: Reference


@dataclass(kw_only=True)
class LocalFinancialOrderPaid(Event):
    financial_order_reference: Reference


@dataclass(kw_only=True)
class FinancialOrderPaid(Event):
    financial_order_reference: Reference


@dataclass(kw_only=True)
class LocalDeliveryOrderPrepared(Event):
    delivery_order_reference: Reference
    raw_recipient_end_user_full_name: str
    raw_recipient_end_user_phone_number: str
    raw_served_end_user_full_name: str
    raw_served_end_user_phone_number: str


@dataclass(kw_only=True)
class DeliveryOrderPrepared(Event):
    delivery_order_reference: Reference
    raw_recipient_end_user_full_name: str
    raw_recipient_end_user_phone_number: str
    raw_served_end_user_full_name: str
    raw_served_end_user_phone_number: str


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


external_events = [
    FinancialOrderCreated,
    FinancialOrderPaid,
    DeliveryOrderPrepared,
    CareAirtableDeliveryOrderRecipientEndUserCreated,
    CareAirtableDeliveryOrderServedEndUserCreated,
]
