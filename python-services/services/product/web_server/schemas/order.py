from typing import List

from pydantic import BaseModel

from modules.domain.types import DateTime, Reference
from modules.web_server.schemas.base import (
    BaseCreateEntitySchema,
    BaseRetrieveEntitySchema,
)
from services.product.domain.models.financial_order import FinancialOrder


class CreateOrderByGuestSchema(BaseModel):
    class _CreateFinancialOrderSchema(BaseCreateEntitySchema):
        organization_reference: Reference
        care_product_reference: Reference
        invoice_email_address: str
        discount_code: str | None

    class _CreateDeliveryOrderSchema(BaseCreateEntitySchema):
        recipient_end_user_full_name: str
        recipient_end_user_phone_number: str
        served_end_user_full_name: str
        served_end_user_phone_number: str
        delivery_address: str

    financial_order: _CreateFinancialOrderSchema
    delivery_orders: List[_CreateDeliveryOrderSchema]


class CreateOrderByOrganizationSchema(BaseModel):
    class _CreateFinancialOrderSchema(BaseCreateEntitySchema):
        care_product_reference: Reference

    class _CreateDeliveryOrderSchema(BaseCreateEntitySchema):
        raw_recipient_end_user_full_name: str
        raw_recipient_end_user_phone_number: str
        raw_served_end_user_full_name: str
        raw_served_end_user_phone_number: str
        delivery_address: str
        is_in_store_pickup: bool

    financial_order: _CreateFinancialOrderSchema
    delivery_orders: List[_CreateDeliveryOrderSchema]


class RetrieveOrderSummarySchema(BaseModel):
    class _RetrieveFinancialOrderSummarySchema(BaseRetrieveEntitySchema):
        pass

    financial_order: _RetrieveFinancialOrderSummarySchema


class RetrieveFinancialOrderSummarySchema(BaseRetrieveEntitySchema):
    ecpay_merchant_trade_no: str
    care_product_reference: Reference
    organization_reference: Reference
    create_time: DateTime


class RetrieveFinancialOrderDetailSchema(RetrieveFinancialOrderSummarySchema):
    ecpay_init_payment_html: str | None
    state: FinancialOrder.StateEnum


class RetrieveDeliveryOrderSummarySchema(BaseRetrieveEntitySchema):
    financial_order_reference: Reference
    raw_recipient_end_user_full_name: str
