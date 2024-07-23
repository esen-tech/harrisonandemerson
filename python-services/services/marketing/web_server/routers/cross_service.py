from fastapi import APIRouter, Depends, Query

from modules.service_layer.message_bus import MessageBus
from modules.web_server.dependencies.auth import service_login_required
from modules.web_server.exceptions import EsenBadRequestError
from modules.web_server.schemas.server import ResponseSchema, StatusEnum
from services.marketing.domain.views import cooperation_code as cooperation_code_views
from services.marketing.domain.views import (
    end_user_care_product_referral_code as end_user_care_product_referral_code_views,
)
from services.marketing.domain.views import promo_code as promo_code_views
from services.marketing.web_server.dependencies.message_bus import get_message_bus
from services.marketing.web_server.schemas.cooperation_code import (
    RetrieveCrossServiceCooperationCodeSchema,
)
from services.marketing.web_server.schemas.end_user_care_product_referral_code import (
    RetrieveCrossServiceEndUserCareProductReferralCodeSchema,
)
from services.marketing.web_server.schemas.promo_code import (
    RetrieveCrossServicePromoCodeSchema,
)

router = APIRouter()


@router.get(
    "/cross_service/cooperation_codes/{cooperation_code_code}",
    tags=["cross_service"],
    dependencies=[Depends(service_login_required)],
    response_model=ResponseSchema[RetrieveCrossServiceCooperationCodeSchema],
)
async def cross_service_get_cooperation_code_by_cooperation_code_code(
    cooperation_code_code: str,
    bus: MessageBus = Depends(get_message_bus),
):
    async for entity in cooperation_code_views.get_cooperation_code_by_cooperation_code_code(
        bus.uow, cooperation_code_code
    ):
        return ResponseSchema[RetrieveCrossServiceCooperationCodeSchema](
            status=StatusEnum.SUCCESS,
            data=RetrieveCrossServiceCooperationCodeSchema.from_orm(entity),
        )


@router.get(
    "/cross_service/end_user_care_product_referral_code",
    tags=["cross_service"],
    dependencies=[Depends(service_login_required)],
    response_model=ResponseSchema[
        RetrieveCrossServiceEndUserCareProductReferralCodeSchema
    ],
)
async def cross_service_get_end_user_care_product_referral_code(
    code: str = Query(default=None),
    bus: MessageBus = Depends(get_message_bus),
):
    async for entity in end_user_care_product_referral_code_views.get_end_user_care_product_referral_code_by_code(
        bus.uow, code
    ):
        if entity is None:
            raise EsenBadRequestError(f"Invalid code `{code}`")
        return ResponseSchema[RetrieveCrossServiceEndUserCareProductReferralCodeSchema](
            status=StatusEnum.SUCCESS,
            data=RetrieveCrossServiceEndUserCareProductReferralCodeSchema.from_orm(
                entity
            ),
        )


@router.get(
    "/cross_service/promo_code",
    tags=["cross_service"],
    dependencies=[Depends(service_login_required)],
    response_model=ResponseSchema[RetrieveCrossServicePromoCodeSchema],
)
async def cross_service_get_promo_code(
    code: str = Query(default=None),
    bus: MessageBus = Depends(get_message_bus),
):
    async for entity in promo_code_views.get_promo_code_by_promo_code_code(
        bus.uow, code
    ):
        if entity is None:
            raise EsenBadRequestError(f"Invalid code `{code}`")
        return ResponseSchema[RetrieveCrossServicePromoCodeSchema](
            status=StatusEnum.SUCCESS,
            data=RetrieveCrossServicePromoCodeSchema.from_orm(entity),
        )
