from modules.domain.types import DateTime, Reference
from modules.web_server.schemas.base import (
    BaseCreateEntitySchema,
    BaseRetrieveEntitySchema,
)
from services.emr.domain.models.file import File


class CreateExaminationReportSchema(BaseCreateEntitySchema):
    class CreateFileGroupSchema(BaseCreateEntitySchema):
        display_name: str

    organization_reference: Reference
    file_group: CreateFileGroupSchema


class RetrieveExaminationReportSummarySchema(BaseRetrieveEntitySchema):
    class _RetrieveFileGroupSummarySchema(BaseRetrieveEntitySchema):
        display_name: str
        create_time: DateTime

    end_user_reference: Reference
    file_group: _RetrieveFileGroupSummarySchema


class RetrieveExaminationReportDetailSchema(RetrieveExaminationReportSummarySchema):
    pass


class RetrieveFileSummarySchema(BaseRetrieveEntitySchema):
    hash: str
    display_name: str
    raw_name: str
    content_type: File.ContentTypeEnum
    size_in_byte: int
    create_time: DateTime


class RetrieveFileDetailSchema(RetrieveFileSummarySchema):
    url: str | None
