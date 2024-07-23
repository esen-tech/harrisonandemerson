import abc
import json

from mailersend import emails
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError

from core.config import get_config as get_core_config
from services.notification.config import get_config as get_notification_config


class EmailGateway(metaclass=abc.ABCMeta):
    @abc.abstractmethod
    def send(
        self, to_email_address: str, subject: str, html_content: str, *args, **kwargs
    ):
        raise NotImplemented


class SendGridEmailGateway(EmailGateway):
    def __init__(self) -> None:
        notification_config = get_notification_config()
        self._client = SendGridAPIClient(notification_config.SENDGRID_API_KEY)

    def send(self, to_email_address: str, subject: str, html_content: str):
        try:
            message = Mail(
                from_email="no-reply@esenmedical.com",
                to_emails=to_email_address,
                subject=subject,
                html_content=html_content,
            )
            response = self._client.send(message)
            print("SendGrid Message Response:")
            print(response.status_code)
            print(response.body)
            print(response.headers)
        except Exception as e:
            print(e)


class MailerSendEmailGateway(EmailGateway):
    def __init__(self) -> None:
        notification_config = get_notification_config()
        self._client = emails.NewEmail(notification_config.MAILERSEND_API_KEY)

    def send(self, to_email_address: str, subject: str, html_content: str):
        try:
            mail_body = {}
            mail_from = {
                "name": "ĒSEN",
                "email": "no-reply@esenmedical.com",
            }

            recipients = [
                {
                    "email": to_email_address,
                }
            ]
            self._client.set_mail_from(mail_from, mail_body)
            self._client.set_mail_to(recipients, mail_body)
            self._client.set_subject(subject, mail_body)
            self._client.set_html_content(html_content, mail_body)
            res = self._client.send(mail_body)
            status, res_str = res.split("\n")
            print("MailerSend Message Response:")
            print(status)
            print(json.loads(res_str))
        except Exception as e:
            print(e)


class SlackEmailGateway(EmailGateway):
    def __init__(self) -> None:
        notification_config = get_notification_config()
        self._client = WebClient(token=notification_config.SLACK_BOT_TOKEN)

    def send(self, to_email_address: str, subject: str, html_content: str):
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
- To Email Address: `{to_email_address}`:
- Subject: `{subject}`
- HTML Content: `{html_content}`""",
            )
            print("---")
            print(result)
        except SlackApiError as e:
            print(e)
