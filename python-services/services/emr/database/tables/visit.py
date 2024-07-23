from modules.database.sa.registry import mapper_registry
from modules.database.sa.types import DateTime, Reference
from modules.database.tables.mixin import get_base_columns
from sqlalchemy import Column, Table

visit_table = Table(
    "visit",
    mapper_registry.metadata,
    *get_base_columns(),
    Column("organization_reference", Reference, nullable=False),
    Column("end_user_reference", Reference, nullable=False),
    Column("appointment_reference", Reference),
    Column("start_time", DateTime, nullable=False),
)
