from datetime import datetime
from typing import List, Type

from sqlalchemy import or_
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from sqlalchemy.sql import expression

from modules.adapter.repository import SqlAlchemyRepository
from modules.domain.types import Reference
from services.product.domain.models.service_product import ServiceProduct


class ServiceProductRepository(SqlAlchemyRepository[ServiceProduct]):
    @property
    def _model(self) -> Type[ServiceProduct]:
        return ServiceProduct

    def get_enhanced_select_statement(
        self, statement: expression.select
    ) -> expression.select:
        return statement.options(
            joinedload(self._model.service_product_insurers),
            joinedload(self._model.service_product_internal_users),
        )

    async def get_all_unexpired_by_organization_reference(
        self, organization_reference: Reference
    ) -> List[ServiceProduct]:
        utc_now = datetime.utcnow()
        statement = (
            select(ServiceProduct)
            .where(
                ServiceProduct.organization_reference == organization_reference,
                ServiceProduct.effective_time <= utc_now,
                or_(
                    ServiceProduct.expire_time == None,
                    ServiceProduct.expire_time >= utc_now,
                ),
            )
            .options(
                joinedload(ServiceProduct.service_product_insurers),
                joinedload(ServiceProduct.service_product_internal_users),
            )
        )
        result = await self._session.execute(statement)
        entities = result.scalars().unique().all()
        return entities

    # async def _get_by(self, **kwargs) -> ServiceProduct:
    #     statement = (
    #         select(self._model)
    #         .filter_by(**kwargs)
    #         .options(
    #             joinedload(ServiceProduct.service_product_insurers),
    #             joinedload(ServiceProduct.service_product_internal_users),
    #         )
    #     )
    #     result = await self._session.execute(statement)
    #     entity = result.scalars().first()
    #     return entity
