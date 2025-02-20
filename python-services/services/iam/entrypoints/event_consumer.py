from core.config import get_config as get_core_config
from modules.pubsub.event import EventConsumer
from services.iam.database.orm import start_mappers
from services.iam.domain.event import ingress_events
from services.iam.service_layer.message_bus import get_message_bus

start_mappers()
core_config = get_core_config()
event_consumer = EventConsumer(
    event_name_to_event_class_map={
        event_cls.__name__: event_cls for event_cls in ingress_events
    },
    message_bus=get_message_bus(),
    queue_name=f"{core_config.SERVICE_NAME}_queue",
)
event_consumer.run_forever()
