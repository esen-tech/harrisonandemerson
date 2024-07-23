import uuid
from typing import List

from fastapi import APIRouter, Depends, Query

from modules.domain.types import Reference
from modules.domain.views.view_enhancer import EnhancedViewSchema, ViewEnhancement
from modules.service_layer.message_bus import MessageBus
from modules.web_server.dependencies.auth import internal_user_login_required
from modules.web_server.schemas.server import ResponseSchema, StatusEnum
from services.product.domain import command
from services.product.domain.views import product as product_views
from services.product.domain.views.page_view_enhancer import (
    care_product_page_view_enhancer,
    service_product_page_view_enhancer,
)
from services.product.web_server.dependencies.message_bus import get_message_bus
from services.product.web_server.schemas.product import (
    CreateCareProductByInternalUserSchema,
    CreateServiceProductByInternalUserSchema,
    RetrieveCareProductDetailSchema,
    RetrieveCareProductSummarySchema,
    RetrieveServiceProductDetailSchema,
    RetrieveServiceProductSummarySchema,
    UpdateCareProductByInternalUserSchema,
    UpdateServiceProductByInternalUserSchema,
)

router = APIRouter()


@router.post(
    "/organizations/{organization_reference}/service_products",
    tags=["product"],
    dependencies=[
        Depends(internal_user_login_required),
    ],
    response_model=ResponseSchema,
)
async def create_organization_service_product_by_internal_user(
    organization_reference: Reference,
    payload: CreateServiceProductByInternalUserSchema,
    bus: MessageBus = Depends(get_message_bus),
):
    reference = uuid.uuid4()
    cmd = command.CreateServiceProductByInternalUser(
        service_product_reference=reference,
        organization_reference=organization_reference,
        payload=payload,
    )
    await bus.handle(cmd)
    return ResponseSchema(status=StatusEnum.SUCCESS)


@router.post(
    "/organizations/{organization_reference}/care_products",
    tags=["product"],
    dependencies=[
        Depends(internal_user_login_required),
    ],
    response_model=ResponseSchema,
)
async def create_organization_care_prouct_by_internal_user(
    organization_reference: Reference,
    payload: CreateCareProductByInternalUserSchema,
    bus: MessageBus = Depends(get_message_bus),
):
    reference = uuid.uuid4()
    cmd = command.CreateCareProductByInternalUser(
        care_product_reference=reference,
        organization_reference=organization_reference,
        payload=payload,
    )
    await bus.handle(cmd)
    return ResponseSchema(status=StatusEnum.SUCCESS)


@router.patch(
    "/organizations/{organization_reference}/service_products/{service_product_reference}",
    tags=["product"],
    dependencies=[
        Depends(internal_user_login_required),
    ],
    response_model=ResponseSchema,
)
async def update_organization_service_prouct_by_internal_user(
    organization_reference: Reference,
    service_product_reference: Reference,
    payload: UpdateServiceProductByInternalUserSchema,
    bus: MessageBus = Depends(get_message_bus),
):
    cmd = command.UpdateServiceProductByInternalUser(
        service_product_reference=service_product_reference,
        payload=payload,
    )
    await bus.handle(cmd)
    return ResponseSchema(status=StatusEnum.SUCCESS)


@router.patch(
    "/organizations/{organization_reference}/care_products/{care_product_reference}",
    tags=["product"],
    dependencies=[
        Depends(internal_user_login_required),
    ],
    response_model=ResponseSchema,
)
async def update_organization_care_prouct_by_internal_user(
    organization_reference: Reference,
    care_product_reference: Reference,
    payload: UpdateCareProductByInternalUserSchema,
    bus: MessageBus = Depends(get_message_bus),
):
    cmd = command.UpdateCareProductByInternalUser(
        care_product_reference=care_product_reference,
        payload=payload,
    )
    await bus.handle(cmd)
    return ResponseSchema(status=StatusEnum.SUCCESS)


@router.get(
    "/organizations/{organization_reference}/service_products",
    tags=["order"],
    dependencies=[
        Depends(internal_user_login_required),
    ],
    response_model=ResponseSchema[
        EnhancedViewSchema[List[RetrieveServiceProductSummarySchema]]
    ],
)
async def get_organization_service_products(
    organization_reference: Reference,
    page_context=Depends(service_product_page_view_enhancer.get_context),
    bus: MessageBus = Depends(get_message_bus),
):
    async for enhanced_entities, page_metadata in product_views.get_service_products_by_organization_reference(
        bus.uow,
        ViewEnhancement(
            enhancer=service_product_page_view_enhancer, context=page_context
        ),
        organization_reference,
    ):
        return ResponseSchema[
            EnhancedViewSchema[List[RetrieveServiceProductSummarySchema]]
        ](
            status=StatusEnum.SUCCESS,
            data=EnhancedViewSchema(
                enhanced_data=[
                    RetrieveServiceProductSummarySchema.from_orm(entity)
                    for entity in enhanced_entities
                ],
                metadata={"page": page_metadata},
            ),
        )


@router.get(
    "/organizations/{organization_reference}/service_products/unexpired",
    tags=["product"],
    response_model=ResponseSchema[List[RetrieveServiceProductSummarySchema]],
)
async def get_unexpired_organization_service_products(
    organization_reference: Reference,
    bus: MessageBus = Depends(get_message_bus),
):
    async for entities in product_views.get_unexpired_service_products_by_organization_reference(
        bus.uow, organization_reference
    ):
        return ResponseSchema[List[RetrieveServiceProductSummarySchema]](
            status=StatusEnum.SUCCESS,
            data=[
                RetrieveServiceProductSummarySchema.from_orm(entity)
                for entity in entities
            ],
        )


@router.get(
    "/care_products",
    tags=["product"],
    response_model=ResponseSchema[List[RetrieveCareProductSummarySchema]],
)
async def get_care_products(
    references: List[Reference] = Query(default=None),
    bus: MessageBus = Depends(get_message_bus),
):
    async for entities in product_views.get_care_products_by_care_product_references(
        bus.uow, references
    ):
        return ResponseSchema[List[RetrieveCareProductSummarySchema]](
            status=StatusEnum.SUCCESS,
            data=[
                RetrieveCareProductSummarySchema.from_orm(entity) for entity in entities
            ],
        )


@router.get(
    "/care_products/unexpired",
    tags=["product"],
    dependencies=[Depends(internal_user_login_required)],
    response_model=ResponseSchema[List[RetrieveCareProductSummarySchema]],
)
async def get_unexpired_care_products(
    bus: MessageBus = Depends(get_message_bus),
):
    async for entities in product_views.get_unexpired_care_products(bus.uow):
        return ResponseSchema[List[RetrieveCareProductSummarySchema]](
            status=StatusEnum.SUCCESS,
            data=[
                RetrieveCareProductSummarySchema.from_orm(entity) for entity in entities
            ],
        )


@router.get(
    "/organizations/{organization_reference}/care_products",
    tags=["order"],
    dependencies=[
        Depends(internal_user_login_required),
    ],
    response_model=ResponseSchema[
        EnhancedViewSchema[List[RetrieveCareProductSummarySchema]]
    ],
)
async def get_organization_care_products(
    organization_reference: Reference,
    page_context=Depends(care_product_page_view_enhancer.get_context),
    bus: MessageBus = Depends(get_message_bus),
):
    async for enhanced_entities, page_metadata in product_views.get_care_products_by_organization_reference(
        bus.uow,
        ViewEnhancement(enhancer=care_product_page_view_enhancer, context=page_context),
        organization_reference,
    ):
        return ResponseSchema[
            EnhancedViewSchema[List[RetrieveCareProductSummarySchema]]
        ](
            status=StatusEnum.SUCCESS,
            data=EnhancedViewSchema(
                enhanced_data=[
                    RetrieveCareProductSummarySchema.from_orm(entity)
                    for entity in enhanced_entities
                ],
                metadata={"page": page_metadata},
            ),
        )


@router.get(
    "/organizations/{organization_reference}/care_products/unexpired",
    tags=["product"],
    response_model=ResponseSchema[List[RetrieveCareProductSummarySchema]],
)
async def get_unexpired_organization_care_products(
    organization_reference: Reference,
    bus: MessageBus = Depends(get_message_bus),
):
    async for entities in product_views.get_unexpired_care_products_by_organization_reference(
        bus.uow, organization_reference
    ):
        return ResponseSchema[List[RetrieveCareProductSummarySchema]](
            status=StatusEnum.SUCCESS,
            data=[
                RetrieveCareProductSummarySchema.from_orm(entity) for entity in entities
            ],
        )


@router.get(
    "/service_products/{service_product_reference}",
    tags=["product"],
    response_model=ResponseSchema[RetrieveServiceProductDetailSchema],
)
async def get_service_product(
    service_product_reference: Reference,
    bus: MessageBus = Depends(get_message_bus),
):
    async for entity in product_views.get_service_product_by_reference(
        bus.uow, service_product_reference
    ):
        return ResponseSchema[RetrieveServiceProductDetailSchema](
            status=StatusEnum.SUCCESS,
            data=RetrieveServiceProductDetailSchema.from_orm(entity),
        )


@router.get(
    "/care_products/{care_product_reference}",
    tags=["product"],
    response_model=ResponseSchema[RetrieveCareProductDetailSchema],
)
async def get_organization_care_product_detail(
    care_product_reference: Reference,
    bus: MessageBus = Depends(get_message_bus),
):
    async for entity in product_views.get_care_product_by_reference(
        bus.uow, care_product_reference
    ):
        return ResponseSchema[RetrieveCareProductDetailSchema](
            status=StatusEnum.SUCCESS,
            data=RetrieveCareProductDetailSchema.from_orm(entity),
        )


@router.get(
    "/service_products",
    tags=["product"],
    response_model=ResponseSchema[List[RetrieveServiceProductSummarySchema]],
)
async def get_service_products(
    references: List[Reference] = Query(default=None),
    bus: MessageBus = Depends(get_message_bus),
):
    data = await product_views.get_service_products_by_references(bus.uow, references)
    return ResponseSchema[List[RetrieveServiceProductSummarySchema]](
        status=StatusEnum.SUCCESS, data=data
    )
