from pydantic import BaseModel


class ConfigSchema(BaseModel):
    SENTRY_DSN: str
