from modules.database.sa.registry import mapper_registry
from modules.database.sa.types import Reference
from modules.database.tables.mixin import get_base_columns
from services.scheduling.database.tables.mixin import (
    get_abstract_appointment_time_slot_columns,
)
from sqlalchemy import Column, Table

room_appointment_time_slot_table = Table(
    "room_appointment_time_slot",
    mapper_registry.metadata,
    *get_base_columns(),
    *get_abstract_appointment_time_slot_columns(),
    Column("room_time_slot_inventory_reference", Reference, index=True, nullable=False),
    Column("room_reference", Reference, index=True, nullable=False),
)
