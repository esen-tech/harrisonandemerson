from modules.database.sa.registry import mapper_registry
from modules.database.sa.types import Reference
from modules.database.tables.mixin import get_base_columns
from sqlalchemy import Column, ForeignKey, Table

service_product_internal_user_table = Table(
    "service_product_internal_user",
    mapper_registry.metadata,
    *get_base_columns(),
    Column(
        "service_product_reference",
        Reference,
        ForeignKey("service_product.reference"),
        nullable=False,
        index=True,
    ),
    Column("internal_user_reference", Reference, nullable=False),
)
