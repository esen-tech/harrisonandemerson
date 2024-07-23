from sqlalchemy import Column, Table

from modules.database.enum import StringSizeEnum
from modules.database.sa.registry import mapper_registry
from modules.database.sa.types import Boolean, Date, String
from modules.database.tables.mixin import get_base_columns
from services.iam.database.tables.mixin import get_abstract_person_columns

end_user_table = Table(
    "end_user",
    mapper_registry.metadata,
    *get_base_columns(),
    *get_abstract_person_columns(),
    Column("phone_number", String(StringSizeEnum.XS.value)),
    Column("email_address", String(StringSizeEnum.M.value)),
    Column("birth_date", Date),
    Column("gender", String(StringSizeEnum.XS.value)),
    Column("blood_type", String(StringSizeEnum.XS.value)),
    Column("correspondence_address", String(StringSizeEnum.L.value)),
    Column("tw_identity_card_number", String(StringSizeEnum.XS.value)),
    Column("passport_number", String(StringSizeEnum.S.value)),
    Column("emergency_contact_first_name", String(StringSizeEnum.S.value)),
    Column("emergency_contact_last_name", String(StringSizeEnum.S.value)),
    Column("emergency_contact_relationship_type", String(StringSizeEnum.XS.value)),
    Column("emergency_contact_phone_number", String(StringSizeEnum.XS.value)),
    Column("is_guest", Boolean),
    Column("airtable_reference", String(StringSizeEnum.XS.value)),
    Column("care_airtable_reference", String(StringSizeEnum.XS.value)),
)
