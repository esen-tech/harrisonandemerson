from sqlalchemy import Column, Table

from modules.database.enum import StringSizeEnum
from modules.database.sa.registry import mapper_registry
from modules.database.sa.types import DateTime, String
from modules.database.tables.mixin import get_base_columns

promo_code_table = Table(
    "promo_code",
    mapper_registry.metadata,
    *get_base_columns(),
    Column("program_name", String(StringSizeEnum.M.value), nullable=False),
    Column("code", String(StringSizeEnum.XS.value), nullable=False),
    Column("effective_time", DateTime, nullable=False),
    Column("expiration_time", DateTime, nullable=False),
)
