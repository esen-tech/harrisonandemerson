from dataclasses import dataclass

from modules.domain.models.entity import Entity
from modules.domain.types import Decimal, Reference


@dataclass(kw_only=True)
class EndUserCareProductReferralCode(Entity):
    end_user_reference: Reference
    code: str
    referee_financial_order_discount_price_amount: Decimal
