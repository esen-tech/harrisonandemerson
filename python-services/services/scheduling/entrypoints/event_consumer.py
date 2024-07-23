from core.config import get_config as get_core_config
from modules.pubsub.event import EventConsumer
from services.scheduling.service_layer.handlers import event_handlers_map
from services.scheduling.web_server.dependencies.message_bus import get_message_bus

core_config = get_core_config()
event_consumer = EventConsumer(
    event_name_to_event_class_map={
        event_cls.__name__: event_cls for event_cls in event_handlers_map.keys()
    },
    message_bus=get_message_bus(),
    queue_name=f"{core_config.SERVICE_NAME}_queue",
)
event_consumer.run_forever()
