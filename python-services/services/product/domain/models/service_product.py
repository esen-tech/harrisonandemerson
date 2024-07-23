from dataclasses import dataclass, field
from typing import List

from modules.domain.models.entity import Entity
from modules.domain.types import Decimal
from services.product.domain.models.abstract_product import AbstractProduct
from services.product.domain.models.service_product_insurer import ServiceProductInsurer
from services.product.domain.models.service_product_internal_user import (
    ServiceProductInternalUser,
)


@dataclass(kw_only=True)
class ServiceProduct(AbstractProduct, Entity):
    registration_fee_amount: Decimal
    duration_in_time_slots: int
    service_product_insurers: List[ServiceProductInsurer] = field(default_factory=list)
    service_product_internal_users: List[ServiceProductInternalUser]
