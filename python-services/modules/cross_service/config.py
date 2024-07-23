from core.env import get_env
from modules.cross_service.schemas.config import ConfigSchema


def get_config() -> ConfigSchema:
    return ConfigSchema(
        SERVICE_ACCESS_TOKEN=get_env("SERVICE_ACCESS_TOKEN"),
    )
