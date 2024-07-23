from modules.database.sa.registry import mapper_registry
from modules.database.sa.types import Reference
from modules.database.tables.mixin import get_base_columns
from services.iam.database.tables.mixin import get_abstract_token_columns
from sqlalchemy import Column, ForeignKey, Table

internal_user_access_token_table = Table(
    "internal_user_access_token",
    mapper_registry.metadata,
    *get_base_columns(),
    *get_abstract_token_columns(),
    Column(
        "internal_user_reference",
        Reference,
        ForeignKey("internal_user.reference"),
        index=True,
    ),
)
