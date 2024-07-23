from typing import Type

from modules.adapter.repository import SqlAlchemyRepository
from services.product.domain.models.financial_order import FinancialOrder


class FinancialOrderRepository(SqlAlchemyRepository[FinancialOrder]):
    @property
    def _model(self) -> Type[FinancialOrder]:
        return FinancialOrder
