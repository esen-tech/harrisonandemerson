from modules.database.config import get_config as get_database_config
from modules.database.database import Database
from modules.service_layer.message_bus import MessageBus
from services.marketing.service_layer import handlers
from services.marketing.service_layer.unit_of_work import SqlAlchemyUnitOfWork

database_config = get_database_config()
database = Database(
    database_config.DATABASE_URL, schema_name=database_config.SCHEMA_NAME
)


def get_message_bus() -> MessageBus:
    return MessageBus(
        uow=SqlAlchemyUnitOfWork(database),
        event_handlers_map=handlers.event_handlers_map,
        command_handler_map=handlers.command_handler_map,
    )
