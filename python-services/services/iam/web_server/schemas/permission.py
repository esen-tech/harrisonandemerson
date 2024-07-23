from modules.web_server.schemas.base import BaseRetrieveEntitySchema


class RetrievePermissionSummarySchema(BaseRetrieveEntitySchema):
    identifier_key: str
    display_sequence: int


class RetrievePermissionDetailSchema(RetrievePermissionSummarySchema):
    pass
