from sqlalchemy import Column, Table

from modules.database.enum import StringSizeEnum
from modules.database.sa.registry import mapper_registry
from modules.database.sa.types import DateTime, Integer, Reference, String, Text
from modules.database.tables.mixin import get_base_columns

care_case_table = Table(
    "care_case",
    mapper_registry.metadata,
    *get_base_columns(),
    Column("subject_end_user_reference", Reference, nullable=False),
    Column("assignee_internal_user_reference", Reference, nullable=False),
    Column("ecpay_order_id", String(StringSizeEnum.XS.value), nullable=False),
    Column("state", String(StringSizeEnum.XS.value), nullable=False),
    Column("onboard_time", DateTime),
    Column("effective_time", DateTime),
    Column("close_time", DateTime),
    Column("care_plan", Text),
    Column("closing_summary", Text),
    Column("total_appointment_inventory_count_for_doctor", Integer, nullable=False),
    Column("allocated_appointment_inventory_count_for_doctor", Integer, nullable=False),
    Column(
        "total_appointment_inventory_count_for_care_manager", Integer, nullable=False
    ),
    Column(
        "allocated_appointment_inventory_count_for_care_manager",
        Integer,
        nullable=False,
    ),
    Column("care_airtable_reference", String(StringSizeEnum.XS.value)),
)
