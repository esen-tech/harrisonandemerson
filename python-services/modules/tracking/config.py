from modules.tracking.schemas.config import ConfigSchema


def get_config() -> ConfigSchema:
    return ConfigSchema(
        SENTRY_DSN="https://e691ab591d1e48ffb6dc71785ca51769@o1353934.ingest.sentry.io/4504088103354368",
    )
