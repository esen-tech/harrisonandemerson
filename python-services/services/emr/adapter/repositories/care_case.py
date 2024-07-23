from typing import Type

from sqlalchemy.orm import joinedload
from sqlalchemy.sql import expression

from modules.adapter.repository import SqlAlchemyRepository
from services.emr.domain.models.care_case import CareCase


class CareCaseRepository(SqlAlchemyRepository[CareCase]):
    @property
    def _model(self) -> Type[CareCase]:
        return CareCase

    def get_enhanced_select_statement(
        self, statement: expression.select
    ) -> expression.select:
        return statement.options(joinedload(self._model.care_case_reviews))
