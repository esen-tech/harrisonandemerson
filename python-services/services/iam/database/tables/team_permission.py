from modules.database.sa.registry import mapper_registry
from modules.database.sa.types import Reference
from modules.database.tables.mixin import get_base_columns
from sqlalchemy import Column, ForeignKey, Table

team_permission_table = Table(
    "team_permission",
    mapper_registry.metadata,
    *get_base_columns(),
    Column(
        "team_reference",
        Reference,
        ForeignKey("team.reference"),
        index=True,
    ),
    Column(
        "permission_reference",
        Reference,
        ForeignKey("permission.reference"),
        index=True,
    ),
)
