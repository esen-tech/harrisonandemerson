from datetime import datetime, timedelta
from decimal import Decimal

from core.config import get_config as get_core_config
from modules.airtable.airtable_api_client import AirtableAPIClient
from modules.airtable.config import get_config as get_airtable_config
from modules.airtable.enum import BaseEnum, TableEnum
from modules.cross_service.cross_service_api_agent import CrossServiceAPIClient
from modules.domain.types import cast_datetime_to_string
from modules.payment.config import get_config as get_payment_config
from modules.payment.ecpay_api_client import ECPayAPIClient
from modules.pubsub.event import EventPublisher
from modules.service_layer.message_bus import MessageBus
from modules.utils.organization import OrganizationSchema, get_organization_name
from modules.web_server.config import get_config as get_web_server_config
from services.product.domain import command, event
from services.product.domain.models.care_product import CareProduct
from services.product.domain.models.care_product_image import CareProductImage
from services.product.domain.models.care_product_promo_code import CareProductPromoCode
from services.product.domain.models.delivery_order import DeliveryOrder
from services.product.domain.models.financial_order import FinancialOrder
from services.product.domain.models.service_product import ServiceProduct
from services.product.domain.models.service_product_insurer import ServiceProductInsurer
from services.product.domain.models.service_product_internal_user import (
    ServiceProductInternalUser,
)
from services.product.service_layer.unit_of_work import SqlAlchemyUnitOfWork


async def create_service_product_by_internal_user(
    cmd: command.CreateServiceProductByInternalUser,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    async with uow:
        service_product = ServiceProduct(
            reference=cmd.service_product_reference,
            organization_reference=cmd.organization_reference,
            display_sku_key=cmd.payload.display_sku_key,
            display_description_key=cmd.payload.display_description_key,
            display_note=cmd.payload.display_note,
            non_covered_price_amount="0",
            effective_time=cmd.payload.effective_time,
            expire_time=cmd.payload.expire_time,
            registration_fee_amount=cmd.payload.registration_fee_amount,
            duration_in_time_slots=cmd.payload.duration_in_time_slots,
            service_product_insurers=[
                ServiceProductInsurer(
                    insurer_reference=service_product_insurer_payload.insurer_reference,
                )
                for service_product_insurer_payload in cmd.payload.service_product_insurers
            ],
            service_product_internal_users=[
                ServiceProductInternalUser(
                    internal_user_reference=service_product_internal_user_payload.internal_user_reference
                )
                for service_product_internal_user_payload in cmd.payload.service_product_internal_users
            ],
        )
        await uow.service_product_repository.add(service_product)
        await uow.commit()


async def create_care_product_by_internal_user(
    cmd: command.CreateCareProductByInternalUser,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    async with uow:
        care_product = CareProduct(
            reference=cmd.care_product_reference,
            organization_reference=cmd.organization_reference,
            display_sku_key=cmd.payload.display_sku_key,
            display_description_key=cmd.payload.display_description_key,
            non_covered_price_amount=cmd.payload.original_price_amount,
            effective_time=cmd.payload.effective_time,
            expire_time=cmd.payload.expire_time,
            original_price_amount=cmd.payload.original_price_amount,
            sale_price_amount=cmd.payload.sale_price_amount,
            display_specification_key=cmd.payload.display_specification_key,
            display_delivery_description_key=cmd.payload.display_delivery_description_key,
            delivery_order_count=cmd.payload.delivery_order_count,
            display_note=cmd.payload.display_note,
            care_product_images=[
                CareProductImage(
                    src=care_product_image_payload.src,
                    sequence=care_product_image_payload.sequence,
                )
                for care_product_image_payload in cmd.payload.care_product_images
            ],
            care_product_promo_codes=[
                CareProductPromoCode(
                    promo_code_reference=care_product_promo_code_payload.promo_code_reference,
                    discount_price_amount=care_product_promo_code_payload.discount_price_amount,
                )
                for care_product_promo_code_payload in cmd.payload.care_product_promo_codes
            ],
        )
        await uow.care_product_repository.add(care_product)
        await uow.commit()


async def update_service_product_by_internal_user(
    cmd: command.UpdateServiceProductByInternalUser,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    async with uow:
        service_product = await uow.service_product_repository.get_by_reference(
            cmd.service_product_reference
        )
        service_product.display_sku_key = cmd.payload.display_sku_key
        service_product.display_description_key = cmd.payload.display_description_key
        service_product.display_note = cmd.payload.display_note
        service_product.effective_time = cmd.payload.effective_time
        service_product.expire_time = cmd.payload.expire_time
        service_product.registration_fee_amount = cmd.payload.registration_fee_amount
        service_product.duration_in_time_slots = cmd.payload.duration_in_time_slots
        service_product.service_product_insurers = [
            ServiceProductInsurer(
                insurer_reference=service_product_insurer_payload.insurer_reference,
            )
            for service_product_insurer_payload in cmd.payload.service_product_insurers
        ]
        service_product.service_product_internal_users = [
            ServiceProductInternalUser(
                internal_user_reference=service_product_internal_user_payload.internal_user_reference
            )
            for service_product_internal_user_payload in cmd.payload.service_product_internal_users
        ]
        await uow.commit()


async def update_care_product_by_internal_user(
    cmd: command.UpdateCareProductByInternalUser,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    async with uow:
        care_product = await uow.care_product_repository.get_by_reference(
            cmd.care_product_reference
        )
        care_product.display_sku_key = cmd.payload.display_sku_key
        care_product.display_description_key = cmd.payload.display_description_key
        care_product.effective_time = cmd.payload.effective_time
        care_product.expire_time = cmd.payload.expire_time
        care_product.original_price_amount = cmd.payload.original_price_amount
        care_product.sale_price_amount = cmd.payload.sale_price_amount
        care_product.display_specification_key = cmd.payload.display_specification_key
        care_product.display_delivery_description_key = (
            cmd.payload.display_delivery_description_key
        )
        care_product.display_note = cmd.payload.display_note
        care_product.care_product_images = [
            CareProductImage(
                src=care_product_image_payload.src,
                sequence=care_product_image_payload.sequence,
            )
            for care_product_image_payload in cmd.payload.care_product_images
        ]
        care_product.care_product_promo_codes = [
            CareProductPromoCode(
                promo_code_reference=care_product_promo_code_payload.promo_code_reference,
                discount_price_amount=care_product_promo_code_payload.discount_price_amount,
            )
            for care_product_promo_code_payload in cmd.payload.care_product_promo_codes
        ]
        await uow.commit()


async def create_order_by_guest(
    cmd: command.CreateOrderByGuest,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    async with uow:
        discount_code = cmd.payload.financial_order.discount_code
        if discount_code is not None:
            web_server_config = get_web_server_config()
            cross_service_api_client = CrossServiceAPIClient(
                web_server_config.PRODUCT_API_HOST
            )
            care_product_dict = await cross_service_api_client.get(
                f"/cross_service/care_products/{cmd.payload.financial_order.care_product_reference}"
            )
            if care_product_dict["delivery_order_count"] > 1:
                discount_code = None

        financial_order = FinancialOrder(
            reference=cmd.financial_order_reference,
            ecpay_merchant_trade_no=cmd.financial_order_reference.hex[:20].upper(),
            organization_reference=cmd.payload.financial_order.organization_reference,
            care_product_reference=cmd.payload.financial_order.care_product_reference,
            invoice_email_address=cmd.payload.financial_order.invoice_email_address,
            raw_discount_code=discount_code,
            state=FinancialOrder.StateEnum.UNPAID.value,
            is_created_by_organization=False,
        )
        await uow.financial_order_repository.add(financial_order)

        for delivery_order_payload in cmd.payload.delivery_orders:
            delivery_order = DeliveryOrder(
                financial_order_reference=cmd.financial_order_reference,
                raw_recipient_end_user_full_name=delivery_order_payload.recipient_end_user_full_name,
                raw_recipient_end_user_phone_number=delivery_order_payload.recipient_end_user_phone_number,
                raw_served_end_user_full_name=delivery_order_payload.served_end_user_full_name,
                raw_served_end_user_phone_number=delivery_order_payload.served_end_user_phone_number,
                delivery_address=delivery_order_payload.delivery_address,
                is_in_store_pickup=False,
                state=DeliveryOrder.StateEnum.WAITING_PAYMENT.value,
            )
            await uow.delivery_order_repository.add(delivery_order)

        await uow.commit()
        bus.push_event(
            event.LocalFinancialOrderCreated(
                financial_order_reference=cmd.financial_order_reference
            )
        )


async def create_order_by_organization(
    cmd: command.CreateOrderByOrganization,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    async with uow:
        financial_order = FinancialOrder(
            reference=cmd.financial_order_reference,
            ecpay_merchant_trade_no=cmd.financial_order_reference.hex[:20].upper(),
            organization_reference=cmd.organization_reference,
            care_product_reference=cmd.payload.financial_order.care_product_reference,
            state=FinancialOrder.StateEnum.UNPAID.value,
            is_created_by_organization=True,
        )
        await uow.financial_order_repository.add(financial_order)

        for delivery_order_payload in cmd.payload.delivery_orders:
            delivery_order = DeliveryOrder(
                financial_order_reference=cmd.financial_order_reference,
                raw_recipient_end_user_full_name=delivery_order_payload.raw_recipient_end_user_full_name,
                raw_recipient_end_user_phone_number=delivery_order_payload.raw_recipient_end_user_phone_number,
                raw_served_end_user_full_name=delivery_order_payload.raw_served_end_user_full_name,
                raw_served_end_user_phone_number=delivery_order_payload.raw_served_end_user_phone_number,
                delivery_address=delivery_order_payload.delivery_address,
                is_in_store_pickup=delivery_order_payload.is_in_store_pickup,
                state=DeliveryOrder.StateEnum.WAITING_PAYMENT.value,
            )
            await uow.delivery_order_repository.add(delivery_order)

        await uow.commit()
        bus.push_event(
            event.LocalFinancialOrderCreated(
                financial_order_reference=cmd.financial_order_reference
            )
        )


async def pay_financial_order_by_webhook(
    cmd: command.PayFinancialOrderByWebhook,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    async with uow:
        financial_order = await uow.financial_order_repository.get_by_reference(
            cmd.financial_order_reference
        )
        financial_order.ecpay_payment_result = cmd.ecpay_payment_result
        financial_order.pay(Decimal(cmd.ecpay_payment_result["TradeAmt"]))
        await uow.commit()
        bus.push_event(
            event.LocalFinancialOrderPaid(
                financial_order_reference=cmd.financial_order_reference
            )
        )


async def pay_financial_order_by_organization(
    cmd: command.PayFinancialOrderByOrganization,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    web_server_config = get_web_server_config()
    cross_service_api_client = CrossServiceAPIClient(web_server_config.PRODUCT_API_HOST)

    async with uow:
        financial_order = await uow.financial_order_repository.get_by_reference(
            cmd.financial_order_reference
        )
        care_product_dict = await cross_service_api_client.get(
            f"/cross_service/care_products/{financial_order.care_product_reference}"
        )
        financial_order.pay(care_product_dict["sale_price_amount"])
        await uow.commit()
        bus.push_event(
            event.LocalFinancialOrderPaid(
                financial_order_reference=cmd.financial_order_reference
            )
        )


async def pay_financial_order_by_synchronizer(
    cmd: command.PayFinancialOrderBySynchronizer,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    async with uow:
        financial_order = await uow.financial_order_repository.get_by_reference(
            cmd.financial_order_reference
        )
        financial_order.ecpay_order_dict = cmd.ecpay_order_dict
        financial_order.pay(Decimal(cmd.ecpay_order_dict["TradeAmt"]))
        await uow.commit()
        bus.push_event(
            event.LocalFinancialOrderPaid(
                financial_order_reference=cmd.financial_order_reference
            )
        )


async def log_financial_order_payment_result(
    command: command.LogFinancialOrderPaymentResult,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    async with uow:
        financial_order = await uow.financial_order_repository.get_by_reference(
            command.financial_order_reference
        )
        financial_order.ecpay_payment_result = command.ecpay_payment_result
        await uow.commit()


async def pull_paid_order_from_ecpay(
    cmd: command.PullPaidOrderFromECPay,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    payment_config = get_payment_config()
    ecpay_api_client = ECPayAPIClient(
        payment_config.ECPAY_HOST,
        payment_config.ECPAY_MERCHANT_ID,
        payment_config.ECPAY_HASH_KEY,
        payment_config.ECPAY_HASH_IV,
    )
    utc_now = datetime.utcnow()
    async with uow:
        financial_orders = await uow.financial_order_repository.get_all_by(
            utc_now - timedelta(days=4) <= FinancialOrder.create_time,
            state=FinancialOrder.StateEnum.UNPAID.value,
        )
        for financial_order in financial_orders:
            ecpay_order_dict = await ecpay_api_client.get_order(
                financial_order.ecpay_merchant_trade_no
            )
            if ecpay_order_dict["PaymentDate"] != "":
                cmd = command.PayFinancialOrderBySynchronizer(
                    financial_order_reference=financial_order.reference,
                    ecpay_order_dict=ecpay_order_dict,
                )
                await bus.handle(cmd)


async def publish_financial_order_created(
    e: event.LocalFinancialOrderCreated,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    publisher.publish(
        event.FinancialOrderCreated(
            financial_order_reference=e.financial_order_reference
        )
    )


async def create_care_airtable_financial_order(
    event: event.FinancialOrderCreated,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    core_config = get_core_config()
    airtable_config = get_airtable_config()
    web_server_config = get_web_server_config()
    cross_service_api_client = CrossServiceAPIClient(web_server_config.IAM_API_HOST)
    airtable_api_client = AirtableAPIClient(airtable_config.AIRTABLE_API_KEY_EDITOR)
    async with uow:
        financial_order = await uow.financial_order_repository.get_by_reference(
            event.financial_order_reference
        )
        organization_dict = await cross_service_api_client.get(
            f"/cross_service/organizations/{financial_order.organization_reference}"
        )
        care_airtable_financial_order_dict = await airtable_api_client.create_record(
            BaseEnum.ESEN_CARE,
            TableEnum.金流訂單,
            {
                "金流狀態": "未付款",
                "通路單位": get_organization_name(OrganizationSchema(**organization_dict)),
                "綠界訂單號": financial_order.ecpay_merchant_trade_no,
                "訂單時間": cast_datetime_to_string(financial_order.create_time),
                "收發票的 Email": financial_order.invoice_email_address,
                "折扣碼": financial_order.raw_discount_code,
                "環境": core_config.ENV.value,
            },
        )
        financial_order.airtable_reference = care_airtable_financial_order_dict["id"]
        await uow.commit()


async def publish_financial_order_paid(
    e: event.LocalFinancialOrderPaid,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    publisher.publish(
        event.FinancialOrderPaid(financial_order_reference=e.financial_order_reference)
    )


async def resolve_payment_for_delivery_orders(
    e: event.LocalFinancialOrderPaid,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    async with uow:
        delivery_orders = await uow.delivery_order_repository.get_all_by(
            financial_order_reference=e.financial_order_reference
        )
        queued_events = []
        for delivery_order in delivery_orders:
            delivery_order.resolve_payment()
            queued_events.append(
                event.LocalDeliveryOrderPrepared(
                    delivery_order_reference=delivery_order.reference,
                    raw_recipient_end_user_full_name=delivery_order.raw_recipient_end_user_full_name,
                    raw_recipient_end_user_phone_number=delivery_order.raw_recipient_end_user_phone_number,
                    raw_served_end_user_full_name=delivery_order.raw_served_end_user_full_name,
                    raw_served_end_user_phone_number=delivery_order.raw_served_end_user_phone_number,
                )
            )
        await uow.commit()
        for queued_event in queued_events:
            bus.push_event(queued_event)


async def publish_delivery_order_prepared(
    e: event.LocalDeliveryOrderPrepared,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    publisher.publish(
        event.DeliveryOrderPrepared(
            delivery_order_reference=e.delivery_order_reference,
            raw_recipient_end_user_full_name=e.raw_recipient_end_user_full_name,
            raw_recipient_end_user_phone_number=e.raw_recipient_end_user_phone_number,
            raw_served_end_user_full_name=e.raw_served_end_user_full_name,
            raw_served_end_user_phone_number=e.raw_served_end_user_phone_number,
        )
    )


async def pay_care_airtable_financial_order(
    event: event.FinancialOrderPaid,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    airtable_config = get_airtable_config()
    airtable_api_client = AirtableAPIClient(airtable_config.AIRTABLE_API_KEY_EDITOR)
    async with uow:
        financial_order = await uow.financial_order_repository.get_by_reference(
            event.financial_order_reference
        )
        care_product = await uow.care_product_repository.get_by_reference(
            financial_order.care_product_reference
        )
        await airtable_api_client.update_record_by_id(
            BaseEnum.ESEN_CARE,
            TableEnum.金流訂單,
            financial_order.airtable_reference,
            {
                "金流狀態": "已下單",
                "商品名稱": care_product.display_sku_key,
                "消費總金額": str(financial_order.paid_price_amount),
            },
            typecast=True,
        )


async def create_care_airtable_delivery_order(
    event: event.DeliveryOrderPrepared,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    core_config = get_core_config()
    airtable_config = get_airtable_config()
    airtable_api_client = AirtableAPIClient(airtable_config.AIRTABLE_API_KEY_EDITOR)
    async with uow:
        delivery_order = await uow.delivery_order_repository.get_by_reference(
            event.delivery_order_reference
        )
        financial_order = await uow.financial_order_repository.get_by_reference(
            delivery_order.financial_order_reference
        )
        care_airtable_delivery_order_dict = await airtable_api_client.create_record(
            BaseEnum.ESEN_CARE,
            TableEnum.物流訂單,
            {
                "金流訂單 Record ID": [financial_order.airtable_reference],
                "物流狀態": "已取貨" if delivery_order.is_in_store_pickup else "待出貨",
                "已在通路商取貨": delivery_order.is_in_store_pickup,
                "收件地址": delivery_order.delivery_address,
                "環境": core_config.ENV.value,
            },
        )
        delivery_order.airtable_reference = care_airtable_delivery_order_dict["id"]
        await uow.commit()


async def update_delivery_order_recipient_end_user(
    e: event.CareAirtableDeliveryOrderRecipientEndUserCreated,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    async with uow:
        delivery_order = await uow.delivery_order_repository.get_by_reference(
            e.delivery_order_reference
        )
        delivery_order.recipient_end_user_reference = e.end_user_reference
        await uow.commit()


async def update_care_airtable_delivery_order_recipient_end_user(
    e: event.CareAirtableDeliveryOrderRecipientEndUserCreated,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    airtable_config = get_airtable_config()
    airtable_api_client = AirtableAPIClient(airtable_config.AIRTABLE_API_KEY_EDITOR)
    async with uow:
        delivery_order = await uow.delivery_order_repository.get_by_reference(
            e.delivery_order_reference
        )
        await airtable_api_client.update_record_by_id(
            BaseEnum.ESEN_CARE,
            TableEnum.物流訂單,
            delivery_order.airtable_reference,
            {"收件人": [e.care_airtable_end_user_reference]},
        )


async def update_delivery_order_served_end_user(
    e: event.CareAirtableDeliveryOrderServedEndUserCreated,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    async with uow:
        delivery_order = await uow.delivery_order_repository.get_by_reference(
            e.delivery_order_reference
        )
        delivery_order.served_end_user_reference = e.end_user_reference
        await uow.commit()


async def update_care_airtable_delivery_order_served_end_user(
    e: event.CareAirtableDeliveryOrderServedEndUserCreated,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    airtable_config = get_airtable_config()
    airtable_api_client = AirtableAPIClient(airtable_config.AIRTABLE_API_KEY_EDITOR)
    async with uow:
        delivery_order = await uow.delivery_order_repository.get_by_reference(
            e.delivery_order_reference
        )
        await airtable_api_client.update_record_by_id(
            BaseEnum.ESEN_CARE,
            TableEnum.物流訂單,
            delivery_order.airtable_reference,
            {"採檢人": [e.care_airtable_end_user_reference]},
        )


command_handler_map = {
    command.CreateServiceProductByInternalUser: create_service_product_by_internal_user,
    command.CreateCareProductByInternalUser: create_care_product_by_internal_user,
    command.UpdateServiceProductByInternalUser: update_service_product_by_internal_user,
    command.UpdateCareProductByInternalUser: update_care_product_by_internal_user,
    command.CreateOrderByGuest: create_order_by_guest,
    command.CreateOrderByOrganization: create_order_by_organization,
    command.PayFinancialOrderByWebhook: pay_financial_order_by_webhook,
    command.PayFinancialOrderByOrganization: pay_financial_order_by_organization,
    command.PayFinancialOrderBySynchronizer: pay_financial_order_by_synchronizer,
    command.LogFinancialOrderPaymentResult: log_financial_order_payment_result,
    command.PullPaidOrderFromECPay: pull_paid_order_from_ecpay,
}

event_handlers_map = {
    event.LocalFinancialOrderCreated: [publish_financial_order_created],
    event.FinancialOrderCreated: [create_care_airtable_financial_order],
    event.LocalFinancialOrderPaid: [
        publish_financial_order_paid,
        resolve_payment_for_delivery_orders,
    ],
    event.LocalDeliveryOrderPrepared: [publish_delivery_order_prepared],
    event.FinancialOrderPaid: [
        pay_care_airtable_financial_order,
    ],
    event.DeliveryOrderPrepared: [create_care_airtable_delivery_order],
    event.CareAirtableDeliveryOrderRecipientEndUserCreated: [
        update_delivery_order_recipient_end_user,
        update_care_airtable_delivery_order_recipient_end_user,
    ],
    event.CareAirtableDeliveryOrderServedEndUserCreated: [
        update_delivery_order_served_end_user,
        update_care_airtable_delivery_order_served_end_user,
    ],
}
