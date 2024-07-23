from modules.database.enum import StringSizeEnum
from modules.database.sa.registry import mapper_registry
from modules.database.sa.types import String
from sqlalchemy import Column, Table

data_version_table = Table(
    "data_version",
    mapper_registry.metadata,
    Column(
        "version_num",
        String(StringSizeEnum.XS.value),
        primary_key=True,
        nullable=False,
    ),
)
