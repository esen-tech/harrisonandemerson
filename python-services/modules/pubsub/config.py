from core.env import get_env
from modules.pubsub.schemas.config import ConfigSchema


def get_config() -> ConfigSchema:
    return ConfigSchema(AMQP_URL=get_env("AMQP_URL"))
