from core.env import get_env
from modules.database.schemas.config import ConfigSchema


def get_config() -> ConfigSchema:
    return ConfigSchema(
        DATABASE_URL=get_env("DATABASE_URL"),
        SCHEMA_NAME=get_env("SCHEMA_NAME"),
        IGNORE_BASE_SCHEMA_NAME=get_env("IGNORE_BASE_SCHEMA_NAME", False),
    )
