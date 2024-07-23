from sqlalchemy import Column, ForeignKey, Table

from modules.database.enum import StringSizeEnum
from modules.database.sa.registry import mapper_registry
from modules.database.sa.types import Reference, String, Time
from modules.database.tables.mixin import get_base_columns

schedule_time_slot_table = Table(
    "schedule_time_slot",
    mapper_registry.metadata,
    *get_base_columns(),
    Column(
        "schedule_reference",
        Reference,
        ForeignKey("schedule.reference"),
        nullable=False,
        index=True,
    ),
    Column("name", String(StringSizeEnum.S.value), nullable=False),
    Column("start_time", Time, nullable=False),
    Column("end_time", Time, nullable=False),
    Column("weekday_indices", String(StringSizeEnum.XS.value), nullable=False),
)
