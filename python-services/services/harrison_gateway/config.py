from core.config import get_config as get_core_config
from core.enum import EnvEnum
from services.harrison_gateway.schemas.config import ConfigSchema


def get_config() -> ConfigSchema:
    config = get_core_config()

    ALLOW_ORIGINS = ["*"]

    if config.ENV == EnvEnum.STAGING:
        ALLOW_ORIGINS = ["https://harrison.stg-cloud.esenmedical.com"]
    elif config.ENV == EnvEnum.PRODUCTION:
        ALLOW_ORIGINS = ["https://harrison.cloud.esenmedical.com"]

    return ConfigSchema(ALLOW_ORIGINS=ALLOW_ORIGINS)
