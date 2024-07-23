from modules.service_layer.message_bus import MessageBus
from modules.service_layer.unit_of_work import VoidUnitOfWork
from services.notification.service_layer.handlers import (
    command_handler_map,
    event_handlers_map,
)


def get_message_bus() -> MessageBus:
    return MessageBus(
        uow=VoidUnitOfWork(),
        event_handlers_map=event_handlers_map,
        command_handler_map=command_handler_map,
    )
