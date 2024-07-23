from modules.web_server.schemas.base import (
    BaseCreateEntitySchema,
    BaseRetrieveEntitySchema,
)


class LoginInternalUserSchema(BaseCreateEntitySchema):
    email_address: str
    password: str


class RetrieveInternalUserSummarySchema(BaseRetrieveEntitySchema):
    first_name: str | None
    last_name: str | None
    avatar_src: str | None
    education: str | None
    biography: str | None
    email_address: str | None


class RetrieveInternalUserDetailSchema(RetrieveInternalUserSummarySchema):
    pass
