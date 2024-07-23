from sqlalchemy import Column, Table

from modules.database.enum import StringSizeEnum
from modules.database.sa.registry import mapper_registry
from modules.database.sa.types import JSON, Boolean, Numeric, Reference, String
from modules.database.tables.mixin import get_base_columns

financial_order_table = Table(
    "financial_order",
    mapper_registry.metadata,
    *get_base_columns(),
    Column("ecpay_merchant_trade_no", String(20), nullable=False),
    Column("ecpay_payment_result", JSON),
    Column("ecpay_order_dict", JSON),
    Column("organization_reference", Reference, nullable=False),
    Column("care_product_reference", Reference, nullable=False),
    Column("paid_price_amount", Numeric),
    Column("invoice_email_address", String(StringSizeEnum.M.value)),
    Column("raw_discount_code", String(StringSizeEnum.XS.value)),
    Column("state", String(StringSizeEnum.XS.value), nullable=False),
    Column("is_created_by_organization", Boolean, nullable=False),
    Column("airtable_reference", String(StringSizeEnum.XS.value)),
)
