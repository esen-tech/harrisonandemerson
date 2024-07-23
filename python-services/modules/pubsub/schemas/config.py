from pydantic import BaseModel


class ConfigSchema(BaseModel):
    AMQP_URL: str
