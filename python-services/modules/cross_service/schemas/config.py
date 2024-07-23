from pydantic import BaseModel


class ConfigSchema(BaseModel):
    SERVICE_ACCESS_TOKEN: str
