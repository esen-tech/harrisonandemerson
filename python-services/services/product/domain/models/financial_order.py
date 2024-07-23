from dataclasses import dataclass
from enum import Enum
from typing import List

from pydantic import constr

from modules.domain.models.entity import Entity
from modules.domain.types import Decimal, Reference
from services.product.domain.models.delivery_order import DeliveryOrder


@dataclass(kw_only=True)
class FinancialOrder(Entity):
    class StateEnum(Enum):
        UNPAID = "UNPAID"
        PAID = "PAID"

    ecpay_merchant_trade_no: constr(max_length=20)
    ecpay_payment_result: dict | None = None
    ecpay_order_dict: dict | None = None
    organization_reference: Reference
    care_product_reference: Reference
    paid_price_amount: Decimal | None = None
    invoice_email_address: str | None = None
    raw_discount_code: str | None = None
    state: StateEnum
    is_created_by_organization: bool
    airtable_reference: str | None = None

    def pay(self, paid_price_amount: Decimal):
        self.paid_price_amount = paid_price_amount
        self.state = FinancialOrder.StateEnum.PAID.value
