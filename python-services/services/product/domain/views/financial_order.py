import uuid
from datetime import datetime
from decimal import Decimal
from typing import AsyncIterator

from modules.cross_service.cross_service_api_agent import CrossServiceAPIClient
from modules.domain.types import Reference, cast_string_to_datetime
from modules.domain.views.view_enhancer import ViewEnhancement
from modules.web_server.config import get_config as get_web_server_config
from services.product.domain.models.financial_order import FinancialOrder
from services.product.service_layer.unit_of_work import SqlAlchemyUnitOfWork


class PromoCodeUnapplicable(Exception):
    pass


async def get_financial_orders_by_organization_reference_and_is_created_by_organization(
    uow: SqlAlchemyUnitOfWork,
    page_view_enhancement: ViewEnhancement,
    organization_reference: Reference,
    is_created_by_organization: bool,
) -> AsyncIterator[FinancialOrder]:
    async with uow:
        enhanced_entities = await uow.financial_order_repository.get_all_by(
            organization_reference=organization_reference,
            is_created_by_organization=is_created_by_organization,
            view_enhancements=[page_view_enhancement],
        )
        count = await uow.financial_order_repository.get_count_by(
            organization_reference=organization_reference,
            is_created_by_organization=is_created_by_organization,
        )
        yield enhanced_entities, page_view_enhancement.enhancer.get_metadata(
            context=page_view_enhancement.context,
            enhanced_entities=enhanced_entities,
            count_all_page=count,
        )


async def get_by_financial_order_reference(
    uow: SqlAlchemyUnitOfWork, order_reference: Reference
) -> AsyncIterator[FinancialOrder]:
    async with uow:
        entity = await uow.financial_order_repository.get_by_reference(order_reference)
        yield entity


async def get_discount_price_amount_by_care_product_reference_and_discount_code(
    uow: SqlAlchemyUnitOfWork,
    care_product_reference: Reference,
    discount_code: str | None,
) -> Decimal:
    discount_price_amount = Decimal("0")
    if discount_code is not None and discount_code != "":
        web_server_config = get_web_server_config()
        cross_service_api_client = CrossServiceAPIClient(
            web_server_config.MARKETING_API_HOST
        )
        if discount_code.startswith("@"):
            # referral code
            end_user_care_product_referral_code_dict = (
                await cross_service_api_client.get(
                    "/cross_service/end_user_care_product_referral_code",
                    params={"code": discount_code},
                )
            )
            discount_price_amount = Decimal(
                end_user_care_product_referral_code_dict[
                    "referee_financial_order_discount_price_amount"
                ]
            )
        else:
            # promo code
            promo_code_dict = await cross_service_api_client.get(
                "/cross_service/promo_code",
                params={"code": discount_code},
            )
            utc_now = datetime.utcnow()
            effective_time = cast_string_to_datetime(promo_code_dict["effective_time"])
            expiration_time = cast_string_to_datetime(
                promo_code_dict["expiration_time"]
            )
            if effective_time <= utc_now < expiration_time:
                care_product = await uow.care_product_repository.get_by_reference(
                    care_product_reference
                )
                care_product_promo_code = next(
                    (
                        cppc
                        for cppc in care_product.care_product_promo_codes
                        if cppc.promo_code_reference
                        == uuid.UUID(promo_code_dict["reference"])
                    ),
                    None,
                )
                if care_product_promo_code is None:
                    raise PromoCodeUnapplicable("The promo code is not applicable")
                discount_price_amount = Decimal(
                    care_product_promo_code.discount_price_amount
                )
            else:
                raise PromoCodeUnapplicable("The promo code is not applicable")
    return discount_price_amount
