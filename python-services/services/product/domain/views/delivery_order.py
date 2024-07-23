from typing import AsyncIterator, List

from modules.domain.types import Reference
from services.product.domain.models.delivery_order import DeliveryOrder
from services.product.service_layer.unit_of_work import SqlAlchemyUnitOfWork


async def get_delivery_orders_by_financial_order_references(
    uow: SqlAlchemyUnitOfWork, financial_order_references: List[Reference]
) -> AsyncIterator[List[DeliveryOrder]]:
    async with uow:
        entities = await uow.delivery_order_repository.get_all_by(
            DeliveryOrder.financial_order_reference.in_(financial_order_references)
        )
        yield entities
