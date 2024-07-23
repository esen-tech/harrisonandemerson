from modules.database.sa.registry import mapper_registry
from modules.database.sa.types import Reference
from modules.database.tables.mixin import get_base_columns
from sqlalchemy import Column, ForeignKey, Table

examination_report_table = Table(
    "examination_report",
    mapper_registry.metadata,
    *get_base_columns(),
    Column("organization_reference", Reference, nullable=False),
    Column("end_user_reference", Reference, nullable=False),
    Column(
        "file_group_reference",
        Reference,
        ForeignKey("file_group.reference"),
        index=True,
    ),
)
