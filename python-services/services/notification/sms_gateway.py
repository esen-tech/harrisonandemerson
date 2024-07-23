import abc

from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError
from twilio.base.exceptions import TwilioRestException
from twilio.rest import Client

from core.config import get_config as get_core_config
from services.notification.config import get_config as get_notification_config


class SMSGateway(metaclass=abc.ABCMeta):
    @abc.abstractmethod
    def send(self, to_phone_number: str, text: str, *args, **kwargs):
        raise NotImplemented


class TwilioSMSGateway(SMSGateway):
    def __init__(self) -> None:
        notification_config = get_notification_config()
        self._client = Client(
            notification_config.TWILIO_ACCOUNT_SID,
            notification_config.TWILIO_AUTH_TOKEN,
        )

    def send(self, to_phone_number: str, text: str):
        notification_config = get_notification_config()
        try:
            message = self._client.messages.create(
                body=text,
                messaging_service_sid=notification_config.TWILIO_MESSAGING_SERVICE_SID,
                to=to_phone_number,
            )
            print(f"Twilio Message SID: {message.sid}")
        except TwilioRestException as e:
            print(e)


class SlackSMSGateway(SMSGateway):
    def __init__(self) -> None:
        notification_config = get_notification_config()
        self._client = WebClient(token=notification_config.SLACK_BOT_TOKEN)

    def send(self, to_phone_number: str, text: str):
        core_config = get_core_config()
        channel_name = "sms-notification"
        conversation_id = None
        try:
            for result in self._client.conversations_list():
                if conversation_id is not None:
                    break
                for channel in result["channels"]:
                    if channel["name"] == channel_name:
                        conversation_id = channel["id"]
                        break
            result = self._client.chat_postMessage(
                channel=conversation_id,
                text=f"""- Env: `{core_config.ENV.value}`
- To Phone Number: `{to_phone_number}`
- Text Message: `{text}`""",
            )
            print("---")
            print(result)
        except SlackApiError as e:
            print(e)
