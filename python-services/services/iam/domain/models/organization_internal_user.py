from dataclasses import dataclass
from enum import Enum

from modules.domain.models.entity import Entity
from modules.domain.types import DateTime, Reference
from services.iam.domain.models.internal_user import InternalUser


@dataclass(kw_only=True)
class OrganizationInternalUser(Entity):
    class EmploymentStateEnum(Enum):
        EMPLOYED = "EMPLOYED"
        NOT_EMPLOYED = "NOT_EMPLOYED"

    organization_reference: Reference
    internal_user: InternalUser
    position: str
    employment_state: EmploymentStateEnum
    last_resign_time: DateTime | None = None
