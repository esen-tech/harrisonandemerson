from modules.database.enum import StringSizeEnum
from modules.database.sa.registry import mapper_registry
from modules.database.sa.types import Date, String
from modules.database.tables.mixin import get_base_columns
from services.iam.database.tables.mixin import get_abstract_person_columns
from sqlalchemy import Column, Table

service_table = Table(
    "service",
    mapper_registry.metadata,
    *get_base_columns(),
    Column("name", String(StringSizeEnum.XS.value), nullable=False),
)
