from dataclasses import dataclass

from modules.domain.models.entity import Entity
from modules.domain.types import Reference
from services.iam.domain.models.internal_user import InternalUser


@dataclass(kw_only=True)
class TeamInternalUser(Entity):
    team_reference: Reference | None = None
    internal_user_reference: Reference | None = None
    internal_user: InternalUser | None = None
