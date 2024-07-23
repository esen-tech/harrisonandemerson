from core.config import get_config as get_core_config
from core.enum import EnvEnum
from core.env import get_env
from modules.storage.schemas.config import ConfigSchema


def get_config() -> ConfigSchema:
    core_config = get_core_config()

    STORAGE_BUCKET_NAME = "esen-bucket-developing"

    if core_config.ENV == EnvEnum.STAGING:
        STORAGE_BUCKET_NAME = "esen-bucket-staging"
    elif core_config.ENV == EnvEnum.PRODUCTION:
        STORAGE_BUCKET_NAME = "esen-bucket-production"

    return ConfigSchema(
        STORAGE_ENGINE_CREDENTIALS=get_env("STORAGE_ENGINE_CREDENTIALS"),
        STORAGE_BUCKET_NAME=STORAGE_BUCKET_NAME,
    )
