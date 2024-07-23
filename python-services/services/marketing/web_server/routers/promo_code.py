import uuid
from typing import List

from fastapi import APIRouter, Depends

from modules.domain.types import Reference
from modules.domain.views.view_enhancer import EnhancedViewSchema, ViewEnhancement
from modules.service_layer.message_bus import MessageBus
from modules.web_server.dependencies.auth import (
    internal_user_identifier_keys_required,
    internal_user_login_required,
)
from modules.web_server.exceptions import EsenBadRequestError
from modules.web_server.schemas.server import ResponseSchema, StatusEnum
from services.marketing.domain import command
from services.marketing.domain.views import promo_code as promo_code_views
from services.marketing.domain.views.page_view_enhancer import (
    promo_code_page_view_enhancer,
)
from services.marketing.service_layer.handlers import DuplicatePromoCodeCode
from services.marketing.web_server.dependencies.message_bus import get_message_bus
from services.marketing.web_server.schemas.promo_code import (
    CreatePromoCodeByInternalUserSchema,
    RetrievePromoCodeDetailSchema,
    RetrievePromoCodeSummarySchema,
)

router = APIRouter()


@router.post(
    "/organizations/{organization_reference}/promo_codes",
    tags=["promo_code"],
    dependencies=[
        Depends(internal_user_login_required),
        Depends(internal_user_identifier_keys_required({"MARKETING_EDITOR"})),
    ],
    response_model=ResponseSchema,
)
async def create_promo_code_by_internal_user(
    organization_reference: Reference,
    payload: CreatePromoCodeByInternalUserSchema,
    bus: MessageBus = Depends(get_message_bus),
):
    reference = uuid.uuid4()
    try:
        cmd = command.CreatePromoCodeByInternalUser(
            promo_code_reference=reference,
            payload=payload,
        )
        await bus.handle(cmd)
    except DuplicatePromoCodeCode as e:
        raise EsenBadRequestError(e)
    return ResponseSchema(status=StatusEnum.SUCCESS)


@router.get(
    "/organizations/{organization_reference}/promo_codes",
    tags=["promo_code"],
    dependencies=[
        Depends(internal_user_login_required),
        Depends(internal_user_identifier_keys_required({"MARKETING_READER"})),
    ],
    response_model=ResponseSchema[
        EnhancedViewSchema[List[RetrievePromoCodeSummarySchema]]
    ],
)
async def get_promo_codes(
    organization_reference: Reference,
    page_context=Depends(promo_code_page_view_enhancer.get_context),
    bus: MessageBus = Depends(get_message_bus),
):
    async for enhanced_entities, page_metadata in promo_code_views.get_promo_codes(
        bus.uow,
        ViewEnhancement(enhancer=promo_code_page_view_enhancer, context=page_context),
    ):
        return ResponseSchema[EnhancedViewSchema[List[RetrievePromoCodeSummarySchema]]](
            status=StatusEnum.SUCCESS,
            data=EnhancedViewSchema(
                enhanced_data=[
                    RetrievePromoCodeSummarySchema.from_orm(entity)
                    for entity in enhanced_entities
                ],
                metadata={"page": page_metadata},
            ),
        )


@router.get(
    "/organizations/{organization_reference}/promo_codes/{promo_code_reference}",
    tags=["promo_code"],
    dependencies=[
        Depends(internal_user_login_required),
        Depends(internal_user_identifier_keys_required({"MARKETING_READER"})),
    ],
    response_model=ResponseSchema[RetrievePromoCodeDetailSchema],
)
async def get_promo_code(
    organization_reference: Reference,
    promo_code_reference: Reference,
    bus: MessageBus = Depends(get_message_bus),
):
    async for entity in promo_code_views.get_promo_code_by_promo_code_reference(
        bus.uow, promo_code_reference
    ):
        return ResponseSchema[RetrievePromoCodeDetailSchema](
            status=StatusEnum.SUCCESS,
            data=RetrievePromoCodeDetailSchema.from_orm(entity),
        )


@router.delete(
    "/organizations/{organization_reference}/promo_codes/{promo_code_reference}",
    tags=["promo_code"],
    dependencies=[
        Depends(internal_user_login_required),
        Depends(internal_user_identifier_keys_required({"MARKETING_EDITOR"})),
    ],
    response_model=ResponseSchema,
)
async def delete_promo_code(
    organization_reference: Reference,
    promo_code_reference: Reference,
    bus: MessageBus = Depends(get_message_bus),
):
    cmd = command.DeletePromoCodeByInternalUser(
        promo_code_reference=promo_code_reference
    )
    await bus.handle(cmd)
    return ResponseSchema(status=StatusEnum.SUCCESS)
