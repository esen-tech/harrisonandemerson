import uuid
from typing import List

from fastapi import APIRouter, Depends, Query

from modules.cross_service.cross_service_api_agent import CrossServiceAPIClient
from modules.domain.types import Reference
from modules.domain.views.view_enhancer import EnhancedViewSchema, ViewEnhancement
from modules.payment.config import get_config as get_payment_config
from modules.payment.ecpay_api_client import ECPayAPIClient
from modules.service_layer.message_bus import MessageBus
from modules.web_server.config import get_config as get_web_server_config
from modules.web_server.dependencies.auth import internal_user_login_required
from modules.web_server.exceptions import EsenBadRequestError
from modules.web_server.schemas.server import ResponseSchema, StatusEnum
from services.product.domain import command
from services.product.domain.models.financial_order import FinancialOrder
from services.product.domain.views import delivery_order as delivery_order_views
from services.product.domain.views import financial_order as financial_order_views
from services.product.domain.views.financial_order import PromoCodeUnapplicable
from services.product.domain.views.page_view_enhancer import (
    financial_order_page_view_enhancer,
)
from services.product.web_server.dependencies.message_bus import get_message_bus
from services.product.web_server.schemas.order import (
    CreateOrderByGuestSchema,
    CreateOrderByOrganizationSchema,
    RetrieveDeliveryOrderSummarySchema,
    RetrieveFinancialOrderDetailSchema,
    RetrieveFinancialOrderSummarySchema,
    RetrieveOrderSummarySchema,
)

router = APIRouter()


@router.post(
    "/orders",
    tags=["order"],
    response_model=ResponseSchema[RetrieveOrderSummarySchema],
)
async def create_order_by_guest(
    payload: CreateOrderByGuestSchema,
    bus: MessageBus = Depends(get_message_bus),
):
    financial_order_reference = uuid.uuid4()
    cmd = command.CreateOrderByGuest(
        financial_order_reference=financial_order_reference,
        payload=payload,
    )
    await bus.handle(cmd)
    return ResponseSchema[RetrieveOrderSummarySchema](
        status=StatusEnum.SUCCESS,
        data=RetrieveOrderSummarySchema(
            financial_order=RetrieveOrderSummarySchema._RetrieveFinancialOrderSummarySchema(
                reference=financial_order_reference
            ),
        ),
    )


@router.post(
    "/organizations/{organization_reference}/orders",
    tags=["order"],
    dependencies=[Depends(internal_user_login_required)],
    response_model=ResponseSchema[RetrieveOrderSummarySchema],
)
async def create_and_pay_order_by_organization(
    organization_reference: Reference,
    payload: CreateOrderByOrganizationSchema,
    bus: MessageBus = Depends(get_message_bus),
):
    financial_order_reference = uuid.uuid4()
    cmd = command.CreateOrderByOrganization(
        financial_order_reference=financial_order_reference,
        organization_reference=organization_reference,
        payload=payload,
    )
    await bus.handle(cmd)
    cmd = command.PayFinancialOrderByOrganization(
        financial_order_reference=financial_order_reference
    )
    await bus.handle(cmd)
    return ResponseSchema[RetrieveOrderSummarySchema](
        status=StatusEnum.SUCCESS,
        data=RetrieveOrderSummarySchema(
            financial_order=RetrieveOrderSummarySchema._RetrieveFinancialOrderSummarySchema(
                reference=financial_order_reference
            ),
        ),
    )


@router.get(
    "/organizations/{organization_reference}/financial_orders",
    tags=["order"],
    dependencies=[
        Depends(internal_user_login_required),
    ],
    response_model=ResponseSchema[
        EnhancedViewSchema[List[RetrieveFinancialOrderSummarySchema]]
    ],
)
async def get_organization_financial_orders(
    organization_reference: Reference,
    is_created_by_organization: bool = Query(default=None),
    page_context=Depends(financial_order_page_view_enhancer.get_context),
    bus: MessageBus = Depends(get_message_bus),
):
    async for enhanced_entities, page_metadata in financial_order_views.get_financial_orders_by_organization_reference_and_is_created_by_organization(
        bus.uow,
        ViewEnhancement(
            enhancer=financial_order_page_view_enhancer, context=page_context
        ),
        organization_reference,
        is_created_by_organization,
    ):
        return ResponseSchema[
            EnhancedViewSchema[List[RetrieveFinancialOrderSummarySchema]]
        ](
            status=StatusEnum.SUCCESS,
            data=EnhancedViewSchema(
                enhanced_data=[
                    RetrieveFinancialOrderSummarySchema.from_orm(entity)
                    for entity in enhanced_entities
                ],
                metadata={"page": page_metadata},
            ),
        )


@router.get(
    "/financial_orders/{financial_order_reference}",
    tags=["order"],
    response_model=ResponseSchema[RetrieveFinancialOrderDetailSchema],
)
async def get_financial_order_detail(
    financial_order_reference: Reference,
    bus: MessageBus = Depends(get_message_bus),
):
    async for entity in financial_order_views.get_by_financial_order_reference(
        bus.uow, financial_order_reference
    ):
        try:
            discount_price_amount = await financial_order_views.get_discount_price_amount_by_care_product_reference_and_discount_code(
                bus.uow, entity.care_product_reference, entity.raw_discount_code
            )
        except PromoCodeUnapplicable as e:
            raise EsenBadRequestError(e)
        data = RetrieveFinancialOrderDetailSchema.from_orm(entity)
        if entity.state == FinancialOrder.StateEnum.UNPAID.value:
            payment_config = get_payment_config()
            web_server_config = get_web_server_config()
            cross_service_api_client = CrossServiceAPIClient(
                web_server_config.PRODUCT_API_HOST
            )
            care_product_dict = await cross_service_api_client.get(
                f"/cross_service/care_products/{entity.care_product_reference}"
            )
            ecpay_api_client = ECPayAPIClient(
                payment_config.ECPAY_HOST,
                payment_config.ECPAY_MERCHANT_ID,
                payment_config.ECPAY_HASH_KEY,
                payment_config.ECPAY_HASH_IV,
            )
            data.ecpay_init_payment_html = await ecpay_api_client.get_order_payment_html(
                entity.ecpay_merchant_trade_no,
                [care_product_dict["display_sku_key"]],
                care_product_dict["sale_price_amount"] - discount_price_amount,
                f"{web_server_config.HARRISON_GATEWAY_HOST}/product/financial_orders/{financial_order_reference}/pay_by_ecpay",
            )
        return ResponseSchema[RetrieveFinancialOrderDetailSchema](
            status=StatusEnum.SUCCESS,
            data=data,
        )


@router.get(
    "/delivery_orders",
    tags=["order"],
    response_model=ResponseSchema[List[RetrieveDeliveryOrderSummarySchema]],
)
async def get_financial_orders(
    financial_order_references: List[Reference] = Query(default=None),
    bus: MessageBus = Depends(get_message_bus),
):
    async for entities in delivery_order_views.get_delivery_orders_by_financial_order_references(
        bus.uow, financial_order_references
    ):
        return ResponseSchema[List[RetrieveDeliveryOrderSummarySchema]](
            status=StatusEnum.SUCCESS,
            data=[
                RetrieveDeliveryOrderSummarySchema.from_orm(entity)
                for entity in entities
            ],
        )
