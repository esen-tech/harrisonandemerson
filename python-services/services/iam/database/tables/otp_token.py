from modules.database.enum import StringSizeEnum
from modules.database.sa.registry import mapper_registry
from modules.database.sa.types import String
from modules.database.tables.mixin import get_base_columns
from services.iam.database.tables.mixin import get_abstract_token_columns
from sqlalchemy import Column, Table

otp_token_table = Table(
    "otp_token",
    mapper_registry.metadata,
    *get_base_columns(),
    *get_abstract_token_columns(),
    Column("serial_number", String(StringSizeEnum.XS.value)),
    Column("state", String(StringSizeEnum.M.value)),
)
