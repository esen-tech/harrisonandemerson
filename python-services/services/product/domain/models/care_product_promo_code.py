from dataclasses import dataclass

from modules.domain.models.entity import Entity
from modules.domain.types import Decimal, Reference


@dataclass(kw_only=True)
class CareProductPromoCode(Entity):
    promo_code_reference: Reference
    discount_price_amount: Decimal
