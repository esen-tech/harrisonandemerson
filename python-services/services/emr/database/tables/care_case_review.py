from sqlalchemy import Column, ForeignKey, Table

from modules.database.enum import StringSizeEnum
from modules.database.sa.registry import mapper_registry
from modules.database.sa.types import Reference, String, Text
from modules.database.tables.mixin import get_base_columns

care_case_review_table = Table(
    "care_case_review",
    mapper_registry.metadata,
    *get_base_columns(),
    Column(
        "care_case_reference",
        Reference,
        ForeignKey("care_case.reference"),
        index=True,
    ),
    Column("care_manager_private_note", Text),
    Column("display_subjective", Text),
    Column("display_objective", Text),
    Column("display_assessment", Text),
    Column("display_plan", Text),
    Column("care_airtable_reference", String(StringSizeEnum.XS.value)),
)
