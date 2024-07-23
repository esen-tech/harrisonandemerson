from sqlalchemy import Column, Table

from modules.database.enum import StringSizeEnum
from modules.database.sa.registry import mapper_registry
from modules.database.sa.types import Numeric, Reference, String
from modules.database.tables.mixin import get_base_columns

end_user_care_product_referral_code_table = Table(
    "end_user_care_product_referral_code",
    mapper_registry.metadata,
    *get_base_columns(),
    Column("end_user_reference", Reference, nullable=False),
    Column("code", String(StringSizeEnum.XS.value), nullable=False, unique=True),
    Column("referee_financial_order_discount_price_amount", Numeric, nullable=False),
)
