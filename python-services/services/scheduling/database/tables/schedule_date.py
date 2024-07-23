from sqlalchemy import Column, ForeignKey, Table

from modules.database.sa.registry import mapper_registry
from modules.database.sa.types import Date, Reference
from modules.database.tables.mixin import get_base_columns

schedule_date_table = Table(
    "schedule_date",
    mapper_registry.metadata,
    *get_base_columns(),
    Column(
        "schedule_reference",
        Reference,
        ForeignKey("schedule.reference"),
        nullable=False,
        index=True,
    ),
    Column("date", Date, nullable=False),
)
