from typing import Type

from modules.adapter.repository import SqlAlchemyRepository
from services.product.domain.models.delivery_order import DeliveryOrder


class DeliveryOrderRepository(SqlAlchemyRepository[DeliveryOrder]):
    @property
    def _model(self) -> Type[DeliveryOrder]:
        return DeliveryOrder
