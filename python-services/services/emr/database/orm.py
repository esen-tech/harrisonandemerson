from sqlalchemy.orm import backref, configure_mappers, relationship

from modules.database.sa.registry import mapper_registry
from services.emr.database.tables.care_case import care_case_table
from services.emr.database.tables.care_case_review import care_case_review_table
from services.emr.database.tables.examination_report import examination_report_table
from services.emr.database.tables.file import file_table
from services.emr.database.tables.file_group import file_group_table
from services.emr.database.tables.visit import visit_table
from services.emr.domain.models.care_case import CareCase
from services.emr.domain.models.care_case_review import CareCaseReview
from services.emr.domain.models.examination_report import ExaminationReport
from services.emr.domain.models.file import File
from services.emr.domain.models.file_group import FileGroup
from services.emr.domain.models.visit import Visit


def start_mappers():
    mapper_registry.map_imperatively(Visit, visit_table)
    mapper_registry.map_imperatively(
        ExaminationReport,
        examination_report_table,
        properties={
            "file_group": relationship(
                "FileGroup", backref=backref("examination_report", uselist=False)
            ),
        },
    )
    mapper_registry.map_imperatively(FileGroup, file_group_table)
    mapper_registry.map_imperatively(
        File,
        file_table,
        properties={
            "file_group": relationship(
                "FileGroup", backref=backref("files", cascade="all, delete-orphan")
            ),
        },
    )

    mapper_registry.map_imperatively(
        CareCase,
        care_case_table,
        properties={
            "care_case_reviews": relationship("CareCaseReview"),
        },
    )
    mapper_registry.map_imperatively(CareCaseReview, care_case_review_table)

    # Read more on the issue [Backref relationships don't populate in the class until instance is created](https://github.com/sqlalchemy/sqlalchemy/issues/7312)
    configure_mappers()
