from dataclasses import dataclass

from modules.domain.models.entity import Entity
from modules.domain.types import Reference
from services.emr.domain.models.file_group import FileGroup


@dataclass(kw_only=True)
class ExaminationReport(Entity):
    organization_reference: Reference
    end_user_reference: Reference
    file_group: FileGroup
