from sqlalchemy import Column, Table

from modules.database.enum import StringSizeEnum
from modules.database.sa.registry import mapper_registry
from modules.database.sa.types import DateTime, String
from modules.database.tables.mixin import get_base_columns

cooperation_code_table = Table(
    "cooperation_code",
    mapper_registry.metadata,
    *get_base_columns(),
    Column("code", String(StringSizeEnum.XS.value), nullable=False),
    Column("expiration_time", DateTime, nullable=False),
    Column("entity_name", String(StringSizeEnum.S.value)),
    Column("operation_remark", String(StringSizeEnum.L.value)),
)
