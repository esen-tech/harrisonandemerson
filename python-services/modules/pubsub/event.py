from __future__ import annotations

from dataclasses import asdict
from typing import TYPE_CHECKING, Dict, Type

from modules.domain.event import Event
from modules.pubsub.message_queue import PublisherClient, SubscriberClient
from modules.pubsub.schemas.message import EventMessageBodySchema

if TYPE_CHECKING:
    from modules.service_layer.message_bus import MessageBus


class EventPublisher(PublisherClient):
    def publish(self, event: Event):
        super().publish(
            EventMessageBodySchema(
                event_name=event.__class__.__name__, event=asdict(event)
            )
        )


class EventConsumer(SubscriberClient):
    def __init__(
        self,
        event_name_to_event_class_map: Dict[str, Type[Event]],
        message_bus: MessageBus,
        queue_name: str,
    ):
        self._event_name_to_event_class_map = event_name_to_event_class_map
        self._message_bus = message_bus
        super().__init__(queue_name)

    async def callback(self, body: dict):
        event_message_body = EventMessageBodySchema(**body)
        event_class = self._event_name_to_event_class_map.get(
            event_message_body.event_name
        )
        # ignore unregistered events
        if event_class is None:
            print("Ignore Message:", event_message_body)
            return
        event = event_class(**event_message_body.event)
        await self._message_bus.handle(event)
