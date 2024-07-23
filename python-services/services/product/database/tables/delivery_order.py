from sqlalchemy import Column, Table

from modules.database.enum import StringSizeEnum
from modules.database.sa.registry import mapper_registry
from modules.database.sa.types import Boolean, Reference, String
from modules.database.tables.mixin import get_base_columns

delivery_order_table = Table(
    "delivery_order",
    mapper_registry.metadata,
    *get_base_columns(),
    Column(
        "financial_order_reference",
        Reference,
        nullable=False,
        index=True,
    ),
    Column(
        "raw_recipient_end_user_full_name",
        String(StringSizeEnum.XS.value),
        nullable=False,
    ),
    Column(
        "raw_recipient_end_user_phone_number",
        String(StringSizeEnum.XS.value),
        nullable=False,
    ),
    Column("recipient_end_user_reference", Reference),
    Column(
        "raw_served_end_user_full_name",
        String(StringSizeEnum.XS.value),
        nullable=False,
    ),
    Column(
        "raw_served_end_user_phone_number",
        String(StringSizeEnum.XS.value),
        nullable=False,
    ),
    Column("served_end_user_reference", Reference),
    Column("delivery_address", String(StringSizeEnum.M.value), nullable=False),
    Column("is_in_store_pickup", Boolean, nullable=False),
    Column("state", String(StringSizeEnum.XS.value), nullable=False),
    Column("airtable_reference", String(StringSizeEnum.XS.value)),
)
