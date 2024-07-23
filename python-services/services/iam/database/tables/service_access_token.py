from modules.database.sa.registry import mapper_registry
from modules.database.sa.types import Reference
from modules.database.tables.mixin import get_base_columns
from services.iam.database.tables.mixin import get_abstract_token_columns
from sqlalchemy import Column, ForeignKey, Table

service_access_token_table = Table(
    "service_access_token",
    mapper_registry.metadata,
    *get_base_columns(),
    *get_abstract_token_columns(),
    Column(
        "service_reference",
        Reference,
        ForeignKey("service.reference"),
        index=True,
    ),
)
