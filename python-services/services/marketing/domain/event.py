from dataclasses import dataclass

from modules.domain.event import Event
from modules.domain.types import Reference


@dataclass(kw_only=True)
class DeliveryOrderServedEndUserCreated(Event):
    delivery_order_reference: Reference
    end_user_reference: Reference


ingress_events = [DeliveryOrderServedEndUserCreated]
