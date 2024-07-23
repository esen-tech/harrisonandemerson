from typing import Type

from sqlalchemy.orm import joinedload
from sqlalchemy.sql import expression

from modules.adapter.repository import SqlAlchemyRepository
from modules.domain.models.entity import Entity
from modules.domain.types import Reference
from services.emr.domain.models.examination_report import ExaminationReport


class ExaminationReportRepository(SqlAlchemyRepository[ExaminationReport]):
    @property
    def _model(self) -> Type[ExaminationReport]:
        return ExaminationReport

    def get_enhanced_select_statement(
        self, statement: expression.select
    ) -> expression.select:
        return statement.options(joinedload(ExaminationReport.file_group))

    async def _delete_by(self, **kwargs):
        entity = await self.get_by(**kwargs)
        await self._session.delete(entity.file_group)
        await self._session.delete(entity)
