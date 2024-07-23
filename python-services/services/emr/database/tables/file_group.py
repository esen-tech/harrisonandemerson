from modules.database.enum import StringSizeEnum
from modules.database.sa.registry import mapper_registry
from modules.database.sa.types import String
from modules.database.tables.mixin import get_base_columns
from sqlalchemy import Column, Table

file_group_table = Table(
    "file_group",
    mapper_registry.metadata,
    *get_base_columns(),
    Column("display_name", String(StringSizeEnum.S.value), nullable=False),
)
