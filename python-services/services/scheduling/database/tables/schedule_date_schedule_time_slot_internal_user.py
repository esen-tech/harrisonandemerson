from sqlalchemy import Column, ForeignKey, Table

from modules.database.sa.registry import mapper_registry
from modules.database.sa.types import Reference
from modules.database.tables.mixin import get_base_columns

schedule_date_schedule_time_slot_internal_user_table = Table(
    "schedule_date_schedule_time_slot_internal_user",
    mapper_registry.metadata,
    *get_base_columns(),
    Column(
        "schedule_date_schedule_time_slot_reference",
        Reference,
        ForeignKey("schedule_date_schedule_time_slot.reference"),
        nullable=False,
        index=True,
    ),
    Column("internal_user_reference", Reference, nullable=False),
)
