from modules.database.enum import StringSizeEnum
from modules.database.sa.types import DateTime, Reference, String
from sqlalchemy import Column
from sqlalchemy.sql import func


def get_base_columns():
    return [
        Column("reference", Reference, primary_key=True, index=True, nullable=False),
        Column("data_alias", String(StringSizeEnum.M.value), nullable=True, index=True),
        Column("create_time", DateTime, index=True, server_default=func.now()),
        Column(
            "update_time",
            DateTime,
            index=True,
            server_default=func.now(),
            onupdate=func.now(),
        ),
    ]


def get_version_columns():
    return [Column("_version", Reference, nullable=False)]
