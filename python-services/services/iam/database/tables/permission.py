from sqlalchemy import Column, String, Table

from modules.database.enum import StringSizeEnum
from modules.database.sa.registry import mapper_registry
from modules.database.sa.types import Integer
from modules.database.tables.mixin import get_base_columns

permission_table = Table(
    "permission",
    mapper_registry.metadata,
    *get_base_columns(),
    Column("identifier_key", String(StringSizeEnum.S.value), unique=True),
    Column("display_sequence", Integer),
)
