from sqlalchemy import Column, ForeignKey, Table

from modules.database.enum import StringSizeEnum
from modules.database.sa.registry import mapper_registry
from modules.database.sa.types import Integer, Reference, String
from modules.database.tables.mixin import get_base_columns

care_product_image_table = Table(
    "care_product_image",
    mapper_registry.metadata,
    *get_base_columns(),
    Column(
        "care_product_reference",
        Reference,
        ForeignKey("care_product.reference"),
        nullable=False,
        index=True,
    ),
    Column("src", String(StringSizeEnum.M.value)),
    Column("sequence", Integer),
)
