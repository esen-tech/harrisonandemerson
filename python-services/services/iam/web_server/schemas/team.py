from typing import List

from modules.web_server.schemas.base import (
    BaseCreateEntitySchema,
    BaseRetrieveEntitySchema,
    BaseUpdateEntitySchema,
)


class RetrieveTeamSummarySchema(BaseRetrieveEntitySchema):
    display_name: str
    display_responsibility: str | None


class RetrieveTeamDetailSchema(RetrieveTeamSummarySchema):
    class _RetrieveTeamPermissionSchema(BaseRetrieveEntitySchema):
        class _RetrievePermissionSchema(BaseRetrieveEntitySchema):
            identifier_key: str

        permission: _RetrievePermissionSchema

    class _RetrieveTeamInternalUserSchema(BaseRetrieveEntitySchema):
        class _RetrieveInternalUserSchema(BaseRetrieveEntitySchema):
            first_name: str | None
            last_name: str | None
            avatar_src: str | None

        internal_user: _RetrieveInternalUserSchema

    team_permissions: List[_RetrieveTeamPermissionSchema]
    team_internal_users: List[_RetrieveTeamInternalUserSchema]


class CreateTeamByInternalUserSchema(BaseCreateEntitySchema):
    display_name: str
    display_responsibility: str | None


class UpdateTeamByInternalUserSchema(BaseUpdateEntitySchema):
    display_name: str | None
    display_responsibility: str | None
