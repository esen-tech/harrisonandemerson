from modules.database.enum import StringSizeEnum
from modules.database.sa.types import Boolean, DateTime, String
from sqlalchemy import Column


def get_abstract_token_columns():
    return [
        Column("value", String(StringSizeEnum.M.value), index=True, nullable=False),
        Column("expiration_time", DateTime, index=True),
        Column("is_active", Boolean, index=True),
    ]


def get_abstract_person_columns():
    return [
        Column("first_name", String(StringSizeEnum.S.value)),
        Column("last_name", String(StringSizeEnum.S.value)),
    ]
