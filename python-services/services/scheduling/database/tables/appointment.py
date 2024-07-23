from sqlalchemy import Column, Table

from modules.database.enum import StringSizeEnum
from modules.database.sa.registry import mapper_registry
from modules.database.sa.types import DateTime, Reference, String
from modules.database.tables.mixin import get_base_columns

appointment_table = Table(
    "appointment",
    mapper_registry.metadata,
    *get_base_columns(),
    Column("organization_reference", Reference, index=True, nullable=False),
    Column("service_product_reference", Reference, index=True, nullable=False),
    Column("end_user_reference", Reference, index=True, nullable=False),
    Column("principal_name", String(StringSizeEnum.S.value)),
    Column("principal_phone_number", String(StringSizeEnum.XS.value)),
    Column("_evaluated_time_slot_start_time", DateTime, nullable=False),
    Column("_evaluated_time_slot_end_time", DateTime, nullable=False),
    Column("state", String(StringSizeEnum.XS.value), nullable=False),
    Column("cooperation_code_code", String(StringSizeEnum.XS.value)),
    Column("airtable_reference", String(StringSizeEnum.XS.value)),
)
