from sqlalchemy import Column, ForeignKey, Table

from modules.database.sa.registry import mapper_registry
from modules.database.sa.types import Reference, Time
from modules.database.tables.mixin import get_base_columns

schedule_date_schedule_time_slot_table = Table(
    "schedule_date_schedule_time_slot",
    mapper_registry.metadata,
    *get_base_columns(),
    Column(
        "schedule_reference",
        Reference,
        ForeignKey("schedule.reference"),
        nullable=False,
        index=True,
    ),
    Column("schedule_date_reference", Reference, nullable=False),
    Column("schedule_time_slot_reference", Reference, nullable=False),
    Column("override_schedule_time_slot_start_time", Time),
    Column("override_schedule_time_slot_end_time", Time),
)
