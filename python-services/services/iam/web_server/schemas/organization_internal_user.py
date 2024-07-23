from typing import List

from modules.domain.types import DateTime
from modules.web_server.schemas.base import BaseRetrieveEntitySchema
from services.iam.domain.models.organization_internal_user import (
    OrganizationInternalUser,
)


class RetrieveOrganizationInternalUserSummarySchema(BaseRetrieveEntitySchema):
    class _RetrieveInternalUserSchema(BaseRetrieveEntitySchema):
        class _RetrieveTeamInternalUserSchema(BaseRetrieveEntitySchema):
            class _RetrieveTeamSchema(BaseRetrieveEntitySchema):
                class _RetrieveOrganizationSchema(BaseRetrieveEntitySchema):
                    pass

                display_name: str
                organization: _RetrieveOrganizationSchema

            team: _RetrieveTeamSchema

        first_name: str | None
        last_name: str | None
        avatar_src: str | None
        team_internal_users: List[_RetrieveTeamInternalUserSchema]

    internal_user: _RetrieveInternalUserSchema
    position: str
    employment_state: OrganizationInternalUser.EmploymentStateEnum
    last_resign_time: DateTime | None


class RetrieveInternalUserDetailSchema(RetrieveOrganizationInternalUserSummarySchema):
    pass
