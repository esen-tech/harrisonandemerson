from core.config import get_config as get_core_config
from core.enum import EnvEnum
from core.env import get_env
from services.notification.schemas.config import ConfigSchema


def get_config() -> ConfigSchema:
    config = get_core_config()

    TWILIO_ACCOUNT_SID = None
    TWILIO_AUTH_TOKEN = None
    TWILIO_MESSAGING_SERVICE_SID = None
    SENDGRID_API_KEY = None
    MAILERSEND_API_KEY = None
    SLACK_BOT_TOKEN = get_env("SLACK_BOT_TOKEN")

    if config.ENV == EnvEnum.DEVELOPING:
        TWILIO_ACCOUNT_SID = ""
        TWILIO_AUTH_TOKEN = ""
        TWILIO_MESSAGING_SERVICE_SID = ""
        SENDGRID_API_KEY = ""
        MAILERSEND_API_KEY = ""
    elif config.ENV == EnvEnum.STAGING:
        TWILIO_ACCOUNT_SID = get_env("TWILIO_ACCOUNT_SID")
        TWILIO_AUTH_TOKEN = get_env("TWILIO_AUTH_TOKEN")
        TWILIO_MESSAGING_SERVICE_SID = "MGdb172dc2bf1a112faea56ab52c679877"
        SENDGRID_API_KEY = get_env("SENDGRID_API_KEY")
        MAILERSEND_API_KEY = get_env("MAILERSEND_API_KEY")
    elif config.ENV == EnvEnum.PRODUCTION:
        TWILIO_ACCOUNT_SID = get_env("TWILIO_ACCOUNT_SID")
        TWILIO_AUTH_TOKEN = get_env("TWILIO_AUTH_TOKEN")
        TWILIO_MESSAGING_SERVICE_SID = "MGdb172dc2bf1a112faea56ab52c679877"
        SENDGRID_API_KEY = get_env("SENDGRID_API_KEY")
        MAILERSEND_API_KEY = get_env("MAILERSEND_API_KEY")

    return ConfigSchema(
        TWILIO_ACCOUNT_SID=TWILIO_ACCOUNT_SID,
        TWILIO_AUTH_TOKEN=TWILIO_AUTH_TOKEN,
        TWILIO_MESSAGING_SERVICE_SID=TWILIO_MESSAGING_SERVICE_SID,
        SENDGRID_API_KEY=SENDGRID_API_KEY,
        MAILERSEND_API_KEY=MAILERSEND_API_KEY,
        SLACK_BOT_TOKEN=SLACK_BOT_TOKEN,
    )
