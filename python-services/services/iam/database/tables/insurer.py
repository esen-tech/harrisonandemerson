from modules.database.enum import StringSizeEnum
from modules.database.sa.registry import mapper_registry
from modules.database.tables.mixin import get_base_columns
from sqlalchemy import Column, String, Table

insurer_table = Table(
    "insurer",
    mapper_registry.metadata,
    *get_base_columns(),
    Column("official_key", String(StringSizeEnum.S.value)),
    Column("display_key", String(StringSizeEnum.S.value)),
)
