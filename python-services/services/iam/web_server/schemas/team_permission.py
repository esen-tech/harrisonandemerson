from typing import List

from modules.domain.types import Reference
from modules.web_server.schemas.base import (
    BaseCreateEntitySchema,
    BaseUpdateEntitySchema,
)


class UpdateTeamTeamPermissionsSchema(BaseUpdateEntitySchema):
    class _CreateTeamPermissionSchema(BaseCreateEntitySchema):
        permission_reference: Reference

    __root__: List[_CreateTeamPermissionSchema]
