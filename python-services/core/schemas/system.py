from core.enum import EnvEnum
from pydantic import BaseModel


class ConfigSchema(BaseModel):
    ENV: EnvEnum
    SERVICE_NAME: str
    ENTRYPOINT_NAME: str
    IMAGE_NAME: str
    RELEASE_IMAGE_TAG: str | None
