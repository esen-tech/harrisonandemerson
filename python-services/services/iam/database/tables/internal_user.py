from sqlalchemy import Column, Table

from modules.database.enum import StringSizeEnum
from modules.database.sa.registry import mapper_registry
from modules.database.sa.types import String
from modules.database.tables.mixin import get_base_columns
from services.iam.database.tables.mixin import get_abstract_person_columns

internal_user_table = Table(
    "internal_user",
    mapper_registry.metadata,
    *get_base_columns(),
    *get_abstract_person_columns(),
    Column("email_address", String(StringSizeEnum.M.value), nullable=False),
    Column("password_salt", String(StringSizeEnum.XS.value), nullable=False),
    Column("hashed_password", String(StringSizeEnum.M.value), nullable=False),
    Column("avatar_src", String(StringSizeEnum.L.value)),
    Column("education", String(StringSizeEnum.S.value)),
    Column("biography", String(StringSizeEnum.L.value)),
)
