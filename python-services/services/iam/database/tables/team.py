from sqlalchemy import Column, ForeignKey, String, Table

from modules.database.enum import StringSizeEnum
from modules.database.sa.registry import mapper_registry
from modules.database.sa.types import Reference
from modules.database.tables.mixin import get_base_columns

team_table = Table(
    "team",
    mapper_registry.metadata,
    *get_base_columns(),
    Column(
        "organization_reference",
        Reference,
        ForeignKey("organization.reference"),
        index=True,
    ),
    Column("display_name", String(StringSizeEnum.S.value)),
    Column("display_responsibility", String(StringSizeEnum.M.value)),
)
