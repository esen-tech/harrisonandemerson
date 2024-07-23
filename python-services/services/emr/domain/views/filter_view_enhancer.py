from enum import Enum

from modules.domain.views.filter_view_enhancer import (
    FilterContextSchema,
    FilterViewEnhancer,
)
from services.emr.domain.models.examination_report import ExaminationReport
from services.emr.domain.models.file import File
from services.emr.domain.models.file_group import FileGroup


class ExaminationReportFilterEnum(Enum):
    REFERENCE = "REFERENCE"
    END_USER_REFERENCE = "END_USER_REFERENCE"


examination_report_filter_view_enhancer = FilterViewEnhancer(
    ExaminationReportFilterEnum
)


@examination_report_filter_view_enhancer.handler(ExaminationReportFilterEnum.REFERENCE)
def handle_reference_filter(statement, filter_context: FilterContextSchema):
    return statement.where(ExaminationReport.reference == filter_context.query)


@examination_report_filter_view_enhancer.handler(
    ExaminationReportFilterEnum.END_USER_REFERENCE
)
def handle_end_user_reference_filter(statement, filter_context: FilterContextSchema):
    return statement.where(ExaminationReport.end_user_reference == filter_context.query)


class FileFilterEnum(Enum):
    REFERENCE = "REFERENCE"
    EXAMINATION_REPORT_REFERENCE = "EXAMINATION_REPORT_REFERENCE"


file_filter_view_enhancer = FilterViewEnhancer(FileFilterEnum)


@file_filter_view_enhancer.handler(FileFilterEnum.REFERENCE)
def handle_reference_filter(statement, filter_context: FilterContextSchema):
    return statement.where(File.reference == filter_context.query)


@file_filter_view_enhancer.handler(FileFilterEnum.EXAMINATION_REPORT_REFERENCE)
def handle_examination_report_reference_filter(
    statement, filter_context: FilterContextSchema
):
    return (
        statement.join(File.file_group)
        .join(FileGroup.examination_report)
        .where(ExaminationReport.reference == filter_context.query)
    )
