from modules.domain.types import Reference
from modules.web_server.schemas.base import BaseCreateEntitySchema


class CreateTeamInternalUserSchema(BaseCreateEntitySchema):
    internal_user_reference: Reference
