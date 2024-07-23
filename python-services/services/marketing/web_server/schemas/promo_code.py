from modules.domain.types import DateTime
from modules.web_server.schemas.base import (
    BaseCreateEntitySchema,
    BaseRetrieveEntitySchema,
)


class CreatePromoCodeByInternalUserSchema(BaseCreateEntitySchema):
    program_name: str
    code: str
    effective_time: DateTime
    expiration_time: DateTime


class RetrievePromoCodeSummarySchema(BaseRetrieveEntitySchema):
    program_name: str
    code: str
    effective_time: DateTime
    expiration_time: DateTime


class RetrievePromoCodeDetailSchema(RetrievePromoCodeSummarySchema):
    pass


class RetrieveCrossServicePromoCodeSchema(BaseRetrieveEntitySchema):
    program_name: str
    code: str
    effective_time: DateTime
    expiration_time: DateTime
