from sqlalchemy import Column, Table

from modules.database.enum import StringSizeEnum
from modules.database.sa.registry import mapper_registry
from modules.database.sa.types import Date, DateTime, Integer, Reference, String
from modules.database.tables.mixin import get_base_columns

schedule_table = Table(
    "schedule",
    mapper_registry.metadata,
    *get_base_columns(),
    Column("organization_reference", Reference, nullable=False),
    Column("name", String(StringSizeEnum.S.value), nullable=False),
    Column("min_date", Date, nullable=False),
    Column("max_date", Date, nullable=False),
    Column("timezone_offset_in_minutes", Integer, nullable=False),
    Column("last_publish_time", DateTime),
)
