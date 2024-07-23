import __main__

from core.enum import EnvEnum
from core.env import get_env
from core.schemas.system import ConfigSchema


def get_config() -> ConfigSchema:
    ENV = get_env("ENV", default=EnvEnum.PRODUCTION)
    SERVICE_NAME = get_env(
        "SERVICE_NAME", default=__main__.__spec__.name.split(".")[-3]
    )
    ENTRYPOINT_NAME = get_env(
        "ENTRYPOINT_NAME", default=__main__.__spec__.name.split(".")[-1]
    )
    IMAGE_NAME = get_env("IMAGE_NAME", default="N/A")
    RELEASE_IMAGE_TAG = get_env("RELEASE_IMAGE_TAG", default="local")

    return ConfigSchema(
        ENV=ENV,
        SERVICE_NAME=SERVICE_NAME,
        ENTRYPOINT_NAME=ENTRYPOINT_NAME,
        IMAGE_NAME=IMAGE_NAME,
        RELEASE_IMAGE_TAG=RELEASE_IMAGE_TAG,
    )
