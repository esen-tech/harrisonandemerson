from modules.database.sa.registry import mapper_registry
from modules.database.sa.types import Reference
from modules.database.tables.mixin import get_base_columns
from sqlalchemy import Column, ForeignKey, Table

organization_organization_table = Table(
    "organization_organization",
    mapper_registry.metadata,
    *get_base_columns(),
    Column(
        "upstream_organization_reference",
        Reference,
        ForeignKey("organization.reference"),
        index=True,
    ),
    Column(
        "downstream_organization_reference",
        Reference,
        ForeignKey("organization.reference"),
        index=True,
    ),
)
