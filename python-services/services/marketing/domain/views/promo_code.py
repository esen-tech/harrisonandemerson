from datetime import datetime
from typing import AsyncIterator, List, Tuple

from modules.domain.types import Reference
from modules.domain.views.page_view_enhancer import PageMetadataSchema
from modules.domain.views.view_enhancer import ViewEnhancement
from services.marketing.domain.models.promo_code import PromoCode
from services.marketing.service_layer.unit_of_work import SqlAlchemyUnitOfWork


async def get_promo_codes(
    uow: SqlAlchemyUnitOfWork, page_view_enhancement: ViewEnhancement
) -> AsyncIterator[Tuple[List[PromoCode], PageMetadataSchema]]:
    async with uow:
        enhanced_entities = await uow.promo_code_repository.get_all_by(
            view_enhancements=[page_view_enhancement],
        )
        count = await uow.promo_code_repository.get_count_by()
        yield enhanced_entities, page_view_enhancement.enhancer.get_metadata(
            context=page_view_enhancement.context,
            enhanced_entities=enhanced_entities,
            count_all_page=count,
        )


async def get_promo_code_by_promo_code_reference(
    uow: SqlAlchemyUnitOfWork, promo_code_reference: Reference
) -> AsyncIterator[PromoCode | None]:
    async with uow:
        entity = await uow.promo_code_repository.get_by_reference(promo_code_reference)
        yield entity


async def get_promo_code_by_promo_code_code(
    uow: SqlAlchemyUnitOfWork, promo_code_code: str
) -> AsyncIterator[PromoCode | None]:
    async with uow:
        entity = await uow.promo_code_repository.get_by(code=promo_code_code)
        yield entity
