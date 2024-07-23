from dataclasses import dataclass
from enum import Enum

from modules.domain.models.entity import Entity
from modules.domain.types import Reference


@dataclass(kw_only=True)
class DeliveryOrder(Entity):
    class StateEnum(Enum):
        WAITING_PAYMENT = "WAITING_PAYMENT"
        TO_BE_SHIPPED = "TO_BE_SHIPPED"
        SHIPPED = "SHIPPED"

    financial_order_reference: Reference
    raw_recipient_end_user_full_name: str
    raw_recipient_end_user_phone_number: str
    recipient_end_user_reference: Reference | None = None
    raw_served_end_user_full_name: str
    raw_served_end_user_phone_number: str
    served_end_user_reference: Reference | None = None
    delivery_address: str
    is_in_store_pickup: bool
    state: StateEnum
    airtable_reference: str | None = None

    def resolve_payment(self):
        self.state = DeliveryOrder.StateEnum.TO_BE_SHIPPED.value
