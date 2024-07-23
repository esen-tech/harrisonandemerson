from sqlalchemy import Column, ForeignKey, Table

from modules.database.enum import StringSizeEnum
from modules.database.sa.registry import mapper_registry
from modules.database.sa.types import DateTime, Reference, String
from modules.database.tables.mixin import get_base_columns

organization_internal_user_table = Table(
    "organization_internal_user",
    mapper_registry.metadata,
    *get_base_columns(),
    Column(
        "organization_reference",
        Reference,
        nullable=False,
    ),
    Column(
        "internal_user_reference",
        Reference,
        ForeignKey("internal_user.reference"),
        index=True,
        nullable=False,
    ),
    Column("position", String(StringSizeEnum.XS.value), nullable=False),
    Column("employment_state", String(StringSizeEnum.XS.value)),
    Column("last_resign_time", DateTime),
)
