from modules.database.sa.registry import mapper_registry
from modules.database.sa.types import Reference
from modules.database.tables.mixin import get_base_columns
from services.scheduling.database.tables.mixin import (
    get_abstract_time_slot_inventory_columns,
)
from sqlalchemy import Column, Table

internal_user_time_slot_inventory_table = Table(
    "internal_user_time_slot_inventory",
    mapper_registry.metadata,
    *get_base_columns(),
    *get_abstract_time_slot_inventory_columns(),
    Column("internal_user_reference", Reference, index=True),
)
