from dataclasses import dataclass

from modules.domain.models.entity import Entity
from modules.domain.types import Reference
from services.iam.domain.models.permission import Permission


@dataclass(kw_only=True)
class TeamPermission(Entity):
    team_reference: Reference | None = None
    permission_reference: Reference | None = None
    permission: Permission | None = None
