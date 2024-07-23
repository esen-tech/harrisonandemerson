from modules.database.sa.registry import mapper_registry
from modules.database.sa.types import Integer, Numeric
from modules.database.tables.mixin import get_base_columns
from services.product.database.tables.mixin import get_abstract_product_columns
from sqlalchemy import Column, Table

service_product_table = Table(
    "service_product",
    mapper_registry.metadata,
    *get_base_columns(),
    *get_abstract_product_columns(),
    Column("registration_fee_amount", Numeric, nullable=False),
    Column("duration_in_time_slots", Integer, nullable=False),
)
