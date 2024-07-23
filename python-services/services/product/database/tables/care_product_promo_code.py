from sqlalchemy import Column, ForeignKey, Table

from modules.database.sa.registry import mapper_registry
from modules.database.sa.types import Numeric, Reference
from modules.database.tables.mixin import get_base_columns

care_product_promo_code_table = Table(
    "care_product_promo_code",
    mapper_registry.metadata,
    *get_base_columns(),
    Column(
        "care_product_reference",
        Reference,
        ForeignKey("care_product.reference"),
        index=True,
        nullable=False,
    ),
    Column("promo_code_reference", Reference, nullable=False),
    Column("discount_price_amount", Numeric, nullable=False),
)
