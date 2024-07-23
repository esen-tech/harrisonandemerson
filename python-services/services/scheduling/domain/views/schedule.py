from typing import AsyncIterator, List, Tuple

from modules.domain.types import Reference
from modules.domain.views.page_view_enhancer import PageMetadataSchema
from modules.domain.views.view_enhancer import ViewEnhancement
from services.scheduling.domain.models.schedule import Schedule
from services.scheduling.service_layer.unit_of_work import SqlAlchemyUnitOfWork


async def get_schedules_and_page_metadata_by_page_and_organization_reference(
    uow: SqlAlchemyUnitOfWork,
    page_view_enhancement: ViewEnhancement,
    organization_reference: Reference,
) -> AsyncIterator[Tuple[List[Schedule], PageMetadataSchema]]:
    async with uow:
        schedules = await uow.schedule_repository.get_all_by(
            organization_reference=organization_reference,
            view_enhancements=[page_view_enhancement],
        )
        count = await uow.schedule_repository.get_count_by(
            organization_reference=organization_reference
        )
        yield schedules, page_view_enhancement.enhancer.get_metadata(
            context=page_view_enhancement.context,
            enhanced_entities=schedules,
            count_all_page=count,
        )


async def get_by_schedule_reference(
    uow: SqlAlchemyUnitOfWork,
    schedule_reference: Reference,
) -> AsyncIterator[Schedule]:
    async with uow:
        schedule = await uow.schedule_repository.get_by_reference(schedule_reference)
        yield schedule
