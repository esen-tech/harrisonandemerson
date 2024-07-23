from typing import AsyncIterator, List

from sqlalchemy.future import select
from sqlalchemy.orm import joinedload

from modules.domain.types import Reference
from modules.domain.views.view_enhancer import ViewEnhancement
from services.product.domain.models.care_product import CareProduct
from services.product.domain.models.service_product import ServiceProduct
from services.product.service_layer.unit_of_work import SqlAlchemyUnitOfWork
from services.product.web_server.schemas.product import (
    RetrieveServiceProductSummarySchema,
)


async def get_unexpired_service_products_by_organization_reference(
    uow: SqlAlchemyUnitOfWork, organization_reference: Reference
) -> AsyncIterator[List[ServiceProduct]]:
    async with uow:
        entities = await uow.service_product_repository.get_all_unexpired_by_organization_reference(
            organization_reference
        )
        yield entities


async def get_care_products_by_care_product_references(
    uow: SqlAlchemyUnitOfWork, care_product_references: List[Reference]
) -> AsyncIterator[List[CareProduct]]:
    async with uow:
        entities = await uow.care_product_repository.get_all_by(
            CareProduct.reference.in_(care_product_references)
        )
        yield entities


async def get_service_products_by_organization_reference(
    uow: SqlAlchemyUnitOfWork,
    page_view_enhancement: ViewEnhancement,
    organization_reference: Reference,
) -> AsyncIterator[ServiceProduct]:
    async with uow:
        enhanced_entities = await uow.service_product_repository.get_all_by(
            organization_reference=organization_reference,
            view_enhancements=[page_view_enhancement],
        )
        count = await uow.service_product_repository.get_count_by(
            organization_reference=organization_reference,
        )
        yield enhanced_entities, page_view_enhancement.enhancer.get_metadata(
            context=page_view_enhancement.context,
            enhanced_entities=enhanced_entities,
            count_all_page=count,
        )


async def get_care_products_by_organization_reference(
    uow: SqlAlchemyUnitOfWork,
    page_view_enhancement: ViewEnhancement,
    organization_reference: Reference,
) -> AsyncIterator[CareProduct]:
    async with uow:
        enhanced_entities = await uow.care_product_repository.get_all_by(
            organization_reference=organization_reference,
            view_enhancements=[page_view_enhancement],
        )
        count = await uow.care_product_repository.get_count_by(
            organization_reference=organization_reference,
        )
        yield enhanced_entities, page_view_enhancement.enhancer.get_metadata(
            context=page_view_enhancement.context,
            enhanced_entities=enhanced_entities,
            count_all_page=count,
        )


async def get_unexpired_care_products(
    uow: SqlAlchemyUnitOfWork,
) -> AsyncIterator[List[CareProduct]]:
    async with uow:
        entities = await uow.care_product_repository.get_all_by()
        yield entities


async def get_unexpired_care_products_by_organization_reference(
    uow: SqlAlchemyUnitOfWork, organization_reference: Reference
) -> AsyncIterator[List[CareProduct]]:
    async with uow:
        entities = await uow.care_product_repository.get_all_unexpired_by_organization_reference(
            organization_reference
        )
        yield entities


async def get_service_product_by_reference(
    uow: SqlAlchemyUnitOfWork, reference: Reference
) -> AsyncIterator[ServiceProduct]:
    async with uow:
        entity = await uow.service_product_repository.get_by_reference(reference)
        yield entity


async def get_care_product_by_reference(
    uow: SqlAlchemyUnitOfWork, reference: Reference
) -> AsyncIterator[CareProduct]:
    async with uow:
        entity = await uow.care_product_repository.get_by_reference(reference)
        yield entity


async def get_service_products_by_references(
    uow: SqlAlchemyUnitOfWork, references: List[Reference]
) -> RetrieveServiceProductSummarySchema:
    async with uow:
        statement = (
            select(ServiceProduct)
            .where(ServiceProduct.reference.in_(references))
            .options(
                joinedload(ServiceProduct.service_product_insurers),
                joinedload(ServiceProduct.service_product_internal_users),
            )
        )
        result = await uow.session.execute(statement)
        entities = result.scalars().unique().all()
        return [
            RetrieveServiceProductSummarySchema.from_orm(entity) for entity in entities
        ]
