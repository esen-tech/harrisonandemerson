from sqlalchemy import Column, Table

from modules.database.enum import StringSizeEnum
from modules.database.sa.registry import mapper_registry
from modules.database.sa.types import Integer, Numeric, String
from modules.database.tables.mixin import get_base_columns
from services.product.database.tables.mixin import get_abstract_product_columns

care_product_table = Table(
    "care_product",
    mapper_registry.metadata,
    *get_base_columns(),
    *get_abstract_product_columns(),
    Column("original_price_amount", Numeric),
    Column("sale_price_amount", Numeric),
    Column("display_specification_key", String(StringSizeEnum.L.value)),
    Column("display_delivery_description_key", String(StringSizeEnum.L.value)),
    Column("delivery_order_count", Integer),
)
