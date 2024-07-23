from enum import Enum

from modules.domain.views.load_view_enhancer import LoadContextSchema, LoadViewEnhancer
from services.emr.domain.models.examination_report import ExaminationReport
from services.emr.domain.models.file import File
from sqlalchemy.orm import joinedload


class EMRLoadEnum(Enum):
    EXAMINATION_REPORT = "EXAMINATION_REPORT"
    FILE = "FILE"


emr_load_view_enhancer = LoadViewEnhancer(EMRLoadEnum)


@emr_load_view_enhancer.handler(EMRLoadEnum.EXAMINATION_REPORT)
def handle_loading_examination_report(statement, _load_context: LoadContextSchema):
    return statement.options(joinedload(ExaminationReport.file_group))


@emr_load_view_enhancer.handler(EMRLoadEnum.FILE)
def handle_loading_file(statement, _load_context: LoadContextSchema):
    return statement.options(joinedload(File.file_group))
