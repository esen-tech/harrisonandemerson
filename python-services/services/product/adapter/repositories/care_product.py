from datetime import datetime
from typing import List, Type

from sqlalchemy import or_
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from sqlalchemy.sql import expression

from modules.adapter.repository import SqlAlchemyRepository
from modules.domain.types import Reference
from services.product.domain.models.care_product import CareProduct


class CareProductRepository(SqlAlchemyRepository[CareProduct]):
    @property
    def _model(self) -> Type[CareProduct]:
        return CareProduct

    def get_enhanced_select_statement(
        self, statement: expression.select
    ) -> expression.select:
        return statement.options(
            joinedload(self._model.care_product_images),
            joinedload(self._model.care_product_promo_codes),
        )

    async def get_all_unexpired_by_organization_reference(
        self, organization_reference: Reference
    ) -> List[CareProduct]:
        utc_now = datetime.utcnow()
        statement = self.get_enhanced_select_statement(select(CareProduct)).where(
            CareProduct.organization_reference == organization_reference,
            CareProduct.effective_time <= utc_now,
            or_(
                CareProduct.expire_time == None,
                CareProduct.expire_time >= utc_now,
            ),
        )
        result = await self._session.execute(statement)
        entities = result.scalars().unique().all()
        return entities
