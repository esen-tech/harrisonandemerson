from modules.database.config import get_config
from modules.database.database import Database
from modules.service_layer.message_bus import MessageBus
from services.emr.service_layer.handlers import command_handler_map, event_handlers_map
from services.emr.service_layer.unit_of_work import SqlAlchemyUnitOfWork

config = get_config()
database = Database(config.DATABASE_URL, schema_name=config.SCHEMA_NAME)


async def get_message_bus() -> MessageBus:
    return MessageBus(
        uow=SqlAlchemyUnitOfWork(database),
        event_handlers_map=event_handlers_map,
        command_handler_map=command_handler_map,
    )
