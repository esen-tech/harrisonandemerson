from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import List

from modules.domain.models.entity import Entity
from modules.domain.types import Date, Reference


@dataclass(kw_only=True)
class Organization(Entity):
    class OperationalStateEnum(Enum):
        OPEN = "OPEN"
        OUT_OF_BUSINESS = "OUT_OF_BUSINESS"

    display_key: str
    branch_key: str | None = None
    phone_number: str | None = None
    banner_src: str | None = None
    correspondence_address: str | None = None
    parent_organization_reference: Reference | None = None
    parent_organization: Organization | None = None
    teams: List["Team"] | None = field(default_factory=list)
    operational_state: OperationalStateEnum | None = None
    registered_name: str | None = None
    registered_address: str | None = None
    registered_medical_specialty: str | None = None
    registered_organization_code: str | None = None
    registered_representative_internal_user_reference: Reference | None = None
    registered_business_commencement_date: Date | None = None
