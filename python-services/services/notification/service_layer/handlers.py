from core.config import get_config as get_core_config
from core.enum import EnvEnum
from modules.pubsub.event import EventPublisher
from modules.service_layer.message_bus import MessageBus
from modules.service_layer.unit_of_work import AbstractUnitOfWork
from services.notification.domain import event
from services.notification.email_gateway import SendGridEmailGateway, SlackEmailGateway
from services.notification.sms_gateway import SlackSMSGateway, TwilioSMSGateway


async def send_signup_otp_notification(
    e: event.EndUserSignupIntentCreated,
    bus: MessageBus,
    uow: AbstractUnitOfWork,
    publisher: EventPublisher,
):
    core_config = get_core_config()
    sms_gateways = [SlackSMSGateway()]
    email_gateways = [SlackEmailGateway()]
    if core_config.ENV != EnvEnum.DEVELOPING:
        sms_gateways.insert(0, TwilioSMSGateway())
        email_gateways.insert(0, SendGridEmailGateway())

    if e.phone_number is not None:
        for sms_gateway in sms_gateways:
            sms_gateway.send(
                e.phone_number, f"您的 ĒSEN 註冊驗證碼是 {e.otp_value}，請於 5 分鐘內輸入完成。"
            )
    if e.email_address is not None:
        for email_gateway in email_gateways:
            email_gateway.send(
                e.email_address,
                "ĒSEN 註冊驗證碼",
                f"您的 ĒSEN 註冊驗證碼是 {e.otp_value}，請於 5 分鐘內輸入完成。",
            )


async def send_login_otp_notification(
    e: event.EndUserLoginIntentCreated,
    bus: MessageBus,
    uow: AbstractUnitOfWork,
    publisher: EventPublisher,
):
    core_config = get_core_config()
    sms_gateways = [SlackSMSGateway()]
    email_gateways = [SlackEmailGateway()]
    if core_config.ENV != EnvEnum.DEVELOPING:
        sms_gateways.insert(0, TwilioSMSGateway())
        email_gateways.insert(0, SendGridEmailGateway())

    if e.phone_number is not None:
        for sms_gateway in sms_gateways:
            sms_gateway.send(
                e.phone_number, f"您的 ĒSEN 登入密碼是 {e.otp_value}，請於 5 分鐘內輸入完成。"
            )
    if e.email_address is not None:
        for email_gateway in email_gateways:
            email_gateway.send(
                e.email_address,
                "ĒSEN 登入密碼",
                f"您的 ĒSEN 登入密碼是 {e.otp_value}，請於 5 分鐘內輸入完成。",
            )


event_handlers_map = {
    event.EndUserSignupIntentCreated: [send_signup_otp_notification],
    event.EndUserLoginIntentCreated: [send_login_otp_notification],
}

command_handler_map = {}
