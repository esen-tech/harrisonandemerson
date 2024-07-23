from typing import AsyncIterator, List

from modules.domain.types import Reference
from modules.domain.views.view_enhancer import EnhancedViewSchema, ViewEnhancement
from services.scheduling.domain.models.appointment import Appointment
from services.scheduling.service_layer.unit_of_work import SqlAlchemyUnitOfWork
from services.scheduling.web_server.schemas.appointment import (
    RetrieveAppointmentSummarySchema,
)


async def get_appointments_by_organization_reference_and_filter_and_page(
    uow: SqlAlchemyUnitOfWork,
    organization_reference: Reference,
    filter_view_enhancement: ViewEnhancement,
    page_view_enhancement: ViewEnhancement,
) -> AsyncIterator[Appointment]:
    async with uow:
        enhanced_entities = await uow.appointment_repository.get_all_by(
            organization_reference=organization_reference,
            view_enhancements=[
                filter_view_enhancement,
                page_view_enhancement,
            ],
        )
        count = await uow.appointment_repository.get_count_by(
            organization_reference=organization_reference,
            view_enhancements=[filter_view_enhancement],
        )
        yield enhanced_entities, page_view_enhancement.enhancer.get_metadata(
            context=page_view_enhancement.context,
            enhanced_entities=enhanced_entities,
            count_all_page=count,
        )


async def get_appointments_by_organization_reference_and_filter(
    uow: SqlAlchemyUnitOfWork,
    organization_reference: Reference,
    filter_view_enhancement: ViewEnhancement,
) -> AsyncIterator[Appointment]:
    async with uow:
        enhanced_entities = await uow.appointment_repository.get_all_by(
            organization_reference=organization_reference,
            view_enhancements=[
                filter_view_enhancement,
            ],
        )
        yield enhanced_entities


async def get_appointments_by_load_and_filters_and_page(
    uow: SqlAlchemyUnitOfWork,
    load_view_enhancement: ViewEnhancement,
    filter_view_enhancements: List[ViewEnhancement],
    page_view_enhancement: ViewEnhancement,
) -> EnhancedViewSchema[List[RetrieveAppointmentSummarySchema]]:
    async with uow:
        enhanced_entities = (
            await uow.appointment_repository.get_all_by_view_enhancements(
                [
                    load_view_enhancement,
                    *filter_view_enhancements,
                    page_view_enhancement,
                ]
            )
        )
        count = await uow.appointment_repository.get_count_by_view_enhancements(
            filter_view_enhancements
        )
        return EnhancedViewSchema[List[RetrieveAppointmentSummarySchema]](
            enhanced_data=[
                RetrieveAppointmentSummarySchema.from_orm(entry)
                for entry in enhanced_entities
            ],
            metadata={
                "page": page_view_enhancement.enhancer.get_metadata(
                    context=page_view_enhancement.context,
                    enhanced_entities=enhanced_entities,
                    count_all_page=count,
                ),
            },
        )


async def get_appointment_by_reference(
    uow: SqlAlchemyUnitOfWork, appointment_reference: Reference
) -> AsyncIterator[Appointment]:
    async with uow:
        appointment = await uow.appointment_repository.get_by_reference(
            appointment_reference
        )
        yield appointment
