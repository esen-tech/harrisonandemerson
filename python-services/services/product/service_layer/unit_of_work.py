from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from modules.database.database import Database
from modules.service_layer.unit_of_work import AbstractUnitOfWork
from services.product.adapter.repositories.care_product import CareProductRepository
from services.product.adapter.repositories.delivery_order import DeliveryOrderRepository
from services.product.adapter.repositories.financial_order import (
    FinancialOrderRepository,
)
from services.product.adapter.repositories.service_product import (
    ServiceProductRepository,
)


class SqlAlchemyUnitOfWork(AbstractUnitOfWork):
    def __init__(self, database: Database):
        self._database = database

    async def __aenter__(self) -> SqlAlchemyUnitOfWork:
        async_session = self._database.get_async_session()
        async with async_session() as session:
            self.session: AsyncSession = session
            self.service_product_repository = ServiceProductRepository(session)
            self.care_product_repository = CareProductRepository(session)
            self.financial_order_repository = FinancialOrderRepository(session)
            self.delivery_order_repository = DeliveryOrderRepository(session)
            await super().__aenter__()
            return self

    async def __aexit__(self, *args):
        await super().__aexit__(*args)
        await self.session.close()

    async def _commit(self):
        await self.session.commit()

    async def rollback(self):
        await self.session.rollback()
