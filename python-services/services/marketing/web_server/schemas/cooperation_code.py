from modules.domain.types import DateTime
from modules.web_server.schemas.base import (
    BaseCreateEntitySchema,
    BaseRetrieveEntitySchema,
)


class CreateCooperationCodeSchema(BaseCreateEntitySchema):
    code: str
    expiration_time: DateTime
    entity_name: str
    operation_remark: str | None


class RetrieveCooperationCodeSummarySchema(BaseRetrieveEntitySchema):
    code: str
    expiration_time: DateTime
    entity_name: str


class RetrieveCooperationCodeDetailSchema(RetrieveCooperationCodeSummarySchema):
    operation_remark: str | None


class RetrieveCrossServiceCooperationCodeSchema(BaseRetrieveEntitySchema):
    code: str
    expiration_time: DateTime
    entity_name: str
    operation_remark: str | None
