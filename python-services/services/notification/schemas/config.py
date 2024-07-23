from pydantic import BaseModel


class ConfigSchema(BaseModel):
    TWILIO_ACCOUNT_SID: str
    TWILIO_AUTH_TOKEN: str
    TWILIO_MESSAGING_SERVICE_SID: str
    SENDGRID_API_KEY: str
    MAILERSEND_API_KEY: str
    SLACK_BOT_TOKEN: str  # https://api.slack.com/apps/A047W8APFLZ/oauth?
