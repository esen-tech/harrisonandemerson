from modules.database.sa.types import DateTime, Integer, Reference
from modules.database.tables.mixin import get_version_columns
from sqlalchemy import Column, ForeignKey


def get_abstract_time_slot_inventory_columns():
    return [
        *get_version_columns(),
        Column("organization_reference", Reference, nullable=False, index=True),
        Column("_time_slot_start_time", DateTime, nullable=False),
        Column("_time_slot_end_time", DateTime, nullable=False),
        Column("total_inventory", Integer, nullable=False),
        Column("total_allocated", Integer, nullable=False),
    ]


def get_abstract_appointment_time_slot_columns():
    return [
        Column("_time_slot_start_time", DateTime, nullable=False),
        Column("_time_slot_end_time", DateTime, nullable=False),
        Column(
            "appointment_reference",
            Reference,
            ForeignKey("appointment.reference"),
            nullable=False,
            index=True,
        ),
        Column("allocated_inventory", Integer, nullable=False),
    ]
