from dataclasses import dataclass
from typing import List

from modules.domain.models.entity import Entity
from services.iam.domain.models.organization import Organization
from services.iam.domain.models.team_internal_user import TeamInternalUser
from services.iam.domain.models.team_permission import TeamPermission


@dataclass(kw_only=True)
class Team(Entity):
    display_name: str
    display_responsibility: str | None = None
    organization: Organization | None = None
    team_permissions: List[TeamPermission]
    team_internal_users: List[TeamInternalUser]
