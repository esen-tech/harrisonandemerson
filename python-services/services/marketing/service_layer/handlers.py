import random
import string
from decimal import Decimal

from modules.pubsub.event import EventPublisher
from modules.service_layer.message_bus import MessageBus
from services.marketing.domain import command, event
from services.marketing.domain.models.cooperation_code import CooperationCode
from services.marketing.domain.models.end_user_care_product_referral_code import (
    EndUserCareProductReferralCode,
)
from services.marketing.domain.models.promo_code import PromoCode
from services.marketing.service_layer.unit_of_work import SqlAlchemyUnitOfWork


class DuplicateCooperationCodeCode(Exception):
    pass


class DuplicatePromoCodeCode(Exception):
    pass


async def create_cooperation_code(
    cmd: command.CreateCooperationCode,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    async with uow:
        duplicate_cooperation_codes = await uow.cooperation_code_repository.get_all_by(
            code=cmd.payload.code
        )
        if len(duplicate_cooperation_codes) > 0:
            raise DuplicateCooperationCodeCode("The code has already been used")

        cooperation_code = CooperationCode(
            reference=cmd.reference,
            code=cmd.payload.code,
            expiration_time=cmd.payload.expiration_time,
            entity_name=cmd.payload.entity_name,
            operation_remark=cmd.payload.operation_remark,
        )
        await uow.cooperation_code_repository.add(cooperation_code)
        await uow.commit()


async def delete_cooperation_code(
    cmd: command.DeleteCooperationCode,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    async with uow:
        await uow.cooperation_code_repository.delete_by_reference(cmd.reference)
        await uow.commit()


async def create_promo_code_by_internal_user(
    cmd: command.CreatePromoCodeByInternalUser,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    async with uow:
        duplicate_promo_codes = await uow.promo_code_repository.get_all_by(
            code=cmd.payload.code
        )
        if len(duplicate_promo_codes) > 0:
            raise DuplicatePromoCodeCode("The code has already been used")

        promo_code = PromoCode(
            reference=cmd.promo_code_reference,
            program_name=cmd.payload.program_name,
            code=cmd.payload.code,
            effective_time=cmd.payload.effective_time,
            expiration_time=cmd.payload.expiration_time,
        )
        await uow.promo_code_repository.add(promo_code)
        await uow.commit()


async def delete_promo_code_by_internal_user(
    cmd: command.DeletePromoCodeByInternalUser,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    async with uow:
        await uow.promo_code_repository.delete_by_reference(cmd.promo_code_reference)
        await uow.commit()


async def create_end_user_care_product_referral_code(
    e: event.DeliveryOrderServedEndUserCreated,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    async with uow:
        end_user_care_product_referral_codes = (
            await uow.end_user_care_product_referral_code_repository.get_all_by(
                end_user_reference=e.end_user_reference
            )
        )
        if len(end_user_care_product_referral_codes) > 0:
            return

        is_code_used = True
        while is_code_used is True:
            code = "".join(
                ["@", random.choice(string.digits)]
                + [
                    random.choice(string.digits + string.ascii_lowercase)
                    for _ in range(3)
                ]
            )
            end_user_care_product_referral_code = (
                await uow.end_user_care_product_referral_code_repository.get_by(
                    code=code
                )
            )
            if end_user_care_product_referral_code is None:
                is_code_used = False

        end_user_care_product_referral_code = EndUserCareProductReferralCode(
            end_user_reference=e.end_user_reference,
            code=code,
            referee_financial_order_discount_price_amount=Decimal("1000"),
        )
        await uow.end_user_care_product_referral_code_repository.add(
            end_user_care_product_referral_code
        )
        await uow.commit()


command_handler_map = {
    command.CreateCooperationCode: create_cooperation_code,
    command.DeleteCooperationCode: delete_cooperation_code,
    command.CreatePromoCodeByInternalUser: create_promo_code_by_internal_user,
    command.DeletePromoCodeByInternalUser: delete_promo_code_by_internal_user,
}

event_handlers_map = {
    event.DeliveryOrderServedEndUserCreated: [
        create_end_user_care_product_referral_code
    ],
}
