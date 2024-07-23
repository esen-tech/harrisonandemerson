from fastapi import APIRouter, Depends

from modules.domain.types import Reference
from modules.service_layer.message_bus import MessageBus
from modules.web_server.dependencies.auth import service_login_required
from modules.web_server.schemas.server import ResponseSchema, StatusEnum
from services.product.web_server.dependencies.message_bus import get_message_bus
from services.product.web_server.schemas.product import (
    RetrieveCrossServiceCareProductSchema,
    RetrieveCrossServiceServiceProductSchema,
)

router = APIRouter()


@router.get(
    "/cross_service/service_products/{service_product_reference}",
    tags=["cross_service"],
    dependencies=[Depends(service_login_required)],
    response_model=ResponseSchema[RetrieveCrossServiceServiceProductSchema],
)
async def cross_service_get_service_product(
    service_product_reference: Reference,
    bus: MessageBus = Depends(get_message_bus),
):
    async with bus.uow:
        service_product = await bus.uow.service_product_repository.get_by_reference(
            service_product_reference
        )
        return ResponseSchema[RetrieveCrossServiceServiceProductSchema](
            status=StatusEnum.SUCCESS,
            data=RetrieveCrossServiceServiceProductSchema.from_orm(service_product),
        )


@router.get(
    "/cross_service/care_products/{care_product_reference}",
    tags=["cross_service"],
    dependencies=[Depends(service_login_required)],
    response_model=ResponseSchema[RetrieveCrossServiceCareProductSchema],
)
async def cross_service_get_care_product(
    care_product_reference: Reference,
    bus: MessageBus = Depends(get_message_bus),
):
    async with bus.uow:
        care_product = await bus.uow.care_product_repository.get_by_reference(
            care_product_reference
        )
        return ResponseSchema[RetrieveCrossServiceCareProductSchema](
            status=StatusEnum.SUCCESS,
            data=RetrieveCrossServiceCareProductSchema.from_orm(care_product),
        )
