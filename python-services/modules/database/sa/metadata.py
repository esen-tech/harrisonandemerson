from modules.database.config import get_config
from sqlalchemy.schema import MetaData


def get_metadata():
    config = get_config()

    if config.IGNORE_BASE_SCHEMA_NAME is False:
        convention = {
            "ix": "ix_%(column_0_label)s",
            "uq": "uq_%(table_name)s_%(column_0_name)s",
            "ck": "ck_%(table_name)s_%(constraint_name)s",
            "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
            "pk": "pk_%(table_name)s",
        }
        return MetaData(schema=config.SCHEMA_NAME, naming_convention=convention)
    else:
        convention = {
            "ix": f"ix_{config.SCHEMA_NAME}_%(column_0_label)s",
            "uq": f"uq_{config.SCHEMA_NAME}_%(table_name)s_%(column_0_name)s",
            "ck": f"ck_{config.SCHEMA_NAME}_%(table_name)s_%(constraint_name)s",
            "fk": f"fk_{config.SCHEMA_NAME}_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
            "pk": f"pk_{config.SCHEMA_NAME}_%(table_name)s",
        }
        return MetaData(naming_convention=convention)
