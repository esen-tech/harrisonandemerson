from modules.database.enum import StringSizeEnum
from modules.database.sa.registry import mapper_registry
from modules.database.sa.types import Integer, Reference, String
from modules.database.tables.mixin import get_base_columns
from sqlalchemy import Column, ForeignKey, Table

file_table = Table(
    "file",
    mapper_registry.metadata,
    *get_base_columns(),
    Column(
        "file_group_reference",
        Reference,
        ForeignKey("file_group.reference"),
        index=True,
    ),
    Column("hash", String(StringSizeEnum.XS.value), nullable=False),
    Column("display_name", String(StringSizeEnum.M.value), nullable=False),
    Column("raw_name", String(StringSizeEnum.M.value), nullable=False),
    Column("content_type", String(StringSizeEnum.XS.value), nullable=False),
    Column("size_in_byte", Integer, nullable=False),
)
