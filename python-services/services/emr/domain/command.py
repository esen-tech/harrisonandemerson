from dataclasses import dataclass

from modules.domain.command import Command
from modules.domain.types import Reference
from modules.storage.storage import StorageObject
from services.emr.web_server.schemas.examination_report import (
    CreateExaminationReportSchema,
)


@dataclass
class CreateExaminationReport(Command):
    end_user_reference: Reference
    payload: CreateExaminationReportSchema


@dataclass
class CreateExaminationReportFile(Command):
    examination_report_reference: Reference
    hash: str
    display_name: str
    raw_name: str
    content_type: str
    size_in_byte: int
    storage_object: StorageObject


@dataclass
class DeleteExaminationReportFile(Command):
    reference: Reference


@dataclass
class DeleteExaminationReport(Command):
    reference: Reference


@dataclass
class PullAirtableCareCase(Command):
    airtable_reference: str
