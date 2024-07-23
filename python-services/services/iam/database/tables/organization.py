from modules.database.enum import StringSizeEnum
from modules.database.sa.registry import mapper_registry
from modules.database.sa.types import Date, Reference, String
from modules.database.tables.mixin import get_base_columns
from sqlalchemy import Column, ForeignKey, Table

organization_table = Table(
    "organization",
    mapper_registry.metadata,
    *get_base_columns(),
    Column("display_key", String(StringSizeEnum.S.value), nullable=False),
    Column("branch_key", String(StringSizeEnum.S.value)),
    Column("phone_number", String(StringSizeEnum.XS.value)),
    Column("banner_src", String(StringSizeEnum.L.value)),
    Column("correspondence_address", String(StringSizeEnum.M.value)),
    Column(
        "parent_organization_reference",
        Reference,
        ForeignKey("organization.reference"),
        index=True,
    ),
    Column("operational_state", String(StringSizeEnum.XS.value)),
    Column("registered_name", String(StringSizeEnum.S.value)),
    Column("registered_address", String(StringSizeEnum.M.value)),
    Column("registered_medical_specialty", String(StringSizeEnum.XS.value)),
    Column("registered_organization_code", String(StringSizeEnum.XS.value)),
    Column("registered_representative_internal_user_reference", Reference),
    Column("registered_business_commencement_date", Date),
)
