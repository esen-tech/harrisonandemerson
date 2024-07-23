from dataclasses import dataclass
from typing import List

from modules.domain.models.entity import Entity
from modules.domain.types import Decimal
from services.product.domain.models.abstract_product import AbstractProduct
from services.product.domain.models.care_product_image import CareProductImage
from services.product.domain.models.care_product_promo_code import CareProductPromoCode


@dataclass(kw_only=True)
class CareProduct(AbstractProduct, Entity):
    original_price_amount: Decimal | None = None
    sale_price_amount: Decimal | None = None
    display_specification_key: str | None = None
    display_delivery_description_key: str | None = None
    delivery_order_count: int | None = None
    care_product_images: List[CareProductImage]
    care_product_promo_codes: List[CareProductPromoCode]
