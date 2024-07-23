from typing import List

from modules.domain.types import DateTime, Decimal, Reference
from modules.web_server.schemas.base import (
    BaseCreateEntitySchema,
    BaseRetrieveEntitySchema,
    BaseUpdateEntitySchema,
)


class CreateServiceProductByInternalUserSchema(BaseCreateEntitySchema):
    class _CreateServiceProductInsurerSchema(BaseCreateEntitySchema):
        insurer_reference: Reference

    class _CreateServiceProductInternalUserSchema(BaseCreateEntitySchema):
        internal_user_reference: Reference

    display_sku_key: str
    display_description_key: str | None = None
    display_note: str | None
    effective_time: DateTime
    expire_time: DateTime
    registration_fee_amount: Decimal
    duration_in_time_slots: int
    service_product_insurers: List[_CreateServiceProductInsurerSchema]
    service_product_internal_users: List[_CreateServiceProductInternalUserSchema]


class CreateCareProductByInternalUserSchema(BaseCreateEntitySchema):
    class _CreateCareProductImageSchema(BaseCreateEntitySchema):
        src: str
        sequence: int

    class _CreateCareProductPromoCodeSchema(BaseCreateEntitySchema):
        promo_code_reference: Reference
        discount_price_amount: Decimal

    display_sku_key: str
    display_description_key: str | None = None
    effective_time: DateTime
    expire_time: DateTime
    original_price_amount: Decimal
    sale_price_amount: Decimal
    display_specification_key: str | None
    display_delivery_description_key: str | None
    delivery_order_count: int
    display_note: str | None
    care_product_images: List[_CreateCareProductImageSchema]
    care_product_promo_codes: List[_CreateCareProductPromoCodeSchema]


class UpdateServiceProductByInternalUserSchema(BaseUpdateEntitySchema):
    class _UpdateServiceProductInsurerSchema(BaseUpdateEntitySchema):
        insurer_reference: Reference

    class _UpdateServiceProductInternalUserSchema(BaseUpdateEntitySchema):
        internal_user_reference: Reference

    display_sku_key: str
    display_description_key: str | None = None
    display_note: str | None
    effective_time: DateTime
    expire_time: DateTime
    registration_fee_amount: Decimal
    duration_in_time_slots: int
    service_product_insurers: List[_UpdateServiceProductInsurerSchema]
    service_product_internal_users: List[_UpdateServiceProductInternalUserSchema]


class UpdateCareProductByInternalUserSchema(BaseUpdateEntitySchema):
    class _UpdateCareProductImageSchema(BaseUpdateEntitySchema):
        src: str
        sequence: int

    class _UpdateCareProductPromoCodeSchema(BaseUpdateEntitySchema):
        promo_code_reference: Reference
        discount_price_amount: Decimal

    display_sku_key: str
    display_description_key: str | None = None
    effective_time: DateTime
    expire_time: DateTime
    original_price_amount: Decimal
    sale_price_amount: Decimal
    display_specification_key: str | None
    display_delivery_description_key: str | None
    display_note: str | None
    care_product_images: List[_UpdateCareProductImageSchema]
    care_product_promo_codes: List[_UpdateCareProductPromoCodeSchema]


class RetrieveCrossServiceServiceProductSchema(BaseRetrieveEntitySchema):
    class RetrieveServiceProductInternalUserSchema(BaseRetrieveEntitySchema):
        internal_user_reference: Reference

    organization_reference: Reference
    display_sku_key: str
    effective_time: DateTime | None
    expire_time: DateTime | None
    duration_in_time_slots: int
    service_product_internal_users: List[RetrieveServiceProductInternalUserSchema]


class RetrieveCrossServiceCareProductSchema(BaseRetrieveEntitySchema):
    organization_reference: Reference
    display_sku_key: str
    non_covered_price_amount: Decimal
    effective_time: DateTime | None
    expire_time: DateTime | None
    original_price_amount: Decimal | None
    sale_price_amount: Decimal | None
    delivery_order_count: int
    display_specification_key: str | None
    display_delivery_description_key: str | None


class RetrieveProductSummarySchema(BaseRetrieveEntitySchema):
    organization_reference: Reference
    display_sku_key: str
    display_description_key: str | None = None
    display_note: str | None = None
    non_covered_price_amount: Decimal
    effective_time: DateTime | None = None
    expire_time: DateTime | None = None


class RetrieveServiceProductSummarySchema(RetrieveProductSummarySchema):
    class RetrieveServiceProductInsurerSchema(BaseRetrieveEntitySchema):
        insurer_reference: Reference

    class RetrieveServiceProductInternalUserSchema(BaseRetrieveEntitySchema):
        internal_user_reference: Reference

    registration_fee_amount: Decimal
    duration_in_time_slots: int
    service_product_insurers: List[RetrieveServiceProductInsurerSchema] = []
    service_product_internal_users: List[RetrieveServiceProductInternalUserSchema]


class RetrieveCareProductSummarySchema(RetrieveProductSummarySchema):
    class _RetrieveCareProductImageSchema(BaseRetrieveEntitySchema):
        src: str
        sequence: int | None

    class _RetrieveCareProductPromoCodeSchema(BaseRetrieveEntitySchema):
        promo_code_reference: Reference
        discount_price_amount: Decimal

    original_price_amount: Decimal | None
    sale_price_amount: Decimal | None
    display_specification_key: str | None
    display_delivery_description_key: str | None
    delivery_order_count: int | None
    care_product_images: List[_RetrieveCareProductImageSchema]
    care_product_promo_codes: List[_RetrieveCareProductPromoCodeSchema]


class RetrieveServiceProductDetailSchema(RetrieveServiceProductSummarySchema):
    pass


class RetrieveCareProductDetailSchema(RetrieveCareProductSummarySchema):
    display_note: str | None = None
