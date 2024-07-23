from typing import Callable, Dict, List, Type

from modules.domain.command import Command
from modules.domain.event import Event
from modules.pubsub.event import EventPublisher
from modules.service_layer.unit_of_work import AbstractUnitOfWork
from modules.tracking.tracker import SentryTracker

Message = Command | Event


class MessageBus:
    def __init__(
        self,
        uow: AbstractUnitOfWork,
        event_handlers_map: Dict[Type[Event], List[Callable]],
        command_handler_map: Dict[Type[Command], Callable],
    ):
        self.uow = uow
        self.event_publisher = EventPublisher()
        self.event_handlers_map = event_handlers_map
        self.command_handler_map = command_handler_map
        self._pending_events = []
        self._tracker = SentryTracker()

    async def handle(self, message: Message):
        self._queue = [message]
        while self._queue:
            message = self._queue.pop(0)
            if isinstance(message, Event):
                await self.handle_event(message)
            elif isinstance(message, Command):
                await self.handle_command(message)
            else:
                raise Exception(f"{message} was not an Event or Command")

    async def handle_event(self, event: Event):
        for handler in self.event_handlers_map[type(event)]:
            try:
                await handler(event, self, self.uow, self.event_publisher)
                self._queue.extend(self._pending_events)
                self._pending_events = []
            except Exception as e:
                self._tracker.capture_exception(e)
                print("===")
                print("Unprocessible event", event)
                print(repr(e))
                continue

    async def handle_command(self, command: Command):
        try:
            handler = self.command_handler_map[type(command)]
            await handler(command, self, self.uow, self.event_publisher)
            self._queue.extend(self._pending_events)
            self._pending_events = []
        except Exception as e:
            self._tracker.capture_exception(e)
            raise e

    def push_event(self, event: Event):
        self._pending_events.append(event)
