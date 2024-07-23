from dataclasses import dataclass
from enum import Enum

from modules.domain.models.entity import Entity
from modules.domain.types import Date
from services.iam.domain.models.abstract_person import AbstractPerson


@dataclass(kw_only=True)
class EndUser(AbstractPerson, Entity):
    class GenderEnum(Enum):
        MALE = "MALE"
        FEMALE = "FEMALE"
        NON_BINARY = "NON_BINARY"

    class BloodTypeEnum(Enum):
        A = "A"
        B = "B"
        AB = "AB"
        O = "O"

    phone_number: str | None = None
    email_address: str | None = None
    birth_date: Date | None = None
    gender: GenderEnum | None = None
    blood_type: BloodTypeEnum | None = None
    correspondence_address: str | None = None
    tw_identity_card_number: str | None = None
    passport_number: str | None = None
    emergency_contact_first_name: str | None = None
    emergency_contact_last_name: str | None = None
    emergency_contact_relationship_type: str | None = None
    emergency_contact_phone_number: str | None = None
    is_guest: bool = False
    airtable_reference: str | None = None
    care_airtable_reference: str | None = None
