import abc
import json
from typing import Callable, List

from core.config import get_config as get_core_config
from core.decorator import coro
from core.enum import EnvEnum
from kombu import Connection, Exchange, Producer, Queue
from kombu.mixins import ConsumerMixin
from kombu.transport.pyamqp import Message
from modules.pubsub.config import get_config
from modules.pubsub.schemas.message import MessageBodySchema


class MessageClient:
    def establish_connection(self):
        config = get_config()
        # https://github.com/celery/kombu/issues/596#issuecomment-225751069
        conn = Connection(config.AMQP_URL)
        revived_conn = conn.ensure_connection(max_retries=3)
        return revived_conn


class MessageBroker:
    esen_exchange = Exchange("esen_exchange", type="fanout", durable=True)


class PublisherClient(MessageClient):
    def publish(self, body: MessageBodySchema):
        config = get_core_config()
        if config.ENV == EnvEnum.TESTING:
            return
        # https://docs.celeryproject.org/projects/kombu/en/stable/userguide/producers.html#basics
        with self.establish_connection() as conn:
            producer = Producer(conn)
            producer.publish(
                body.json(),
                serializer="json",
                exchange=MessageBroker.esen_exchange,
                declare=[MessageBroker.esen_exchange],
                retry=True,
                retry_policy={
                    "interval_start": 0,  # First retry immediately,
                    "interval_step": 2,  # then increase by 2s for every retry.
                    "interval_max": 10,  # but don't exceed 10s between retries.
                    "max_retries": 3,  # give up after 3 tries.
                },
            )


class SubscriberClient(MessageClient, ConsumerMixin, metaclass=abc.ABCMeta):
    def __init__(self, queue_name: str):
        self.connection = self.establish_connection()
        self._queue_name = queue_name

    def run_forever(self):
        self.run()

    def get_consumers(self, Consumer, channel):
        return [
            Consumer(
                [
                    Queue(
                        self._queue_name,
                        exchange=MessageBroker.esen_exchange,
                        routing_key=f"{self._queue_name}_routing_key",
                    )
                ],
                callbacks=self.create_callbacks(),
                accept=["json"],
            ),
        ]

    def create_callbacks(self) -> List[Callable]:
        def _callback(body: str, raw_message: Message):
            parsed_body = json.loads(body)
            coro(self.callback)(parsed_body)
            raw_message.ack()

        return [_callback]

    @abc.abstractmethod
    async def callback(self, body: dict):
        raise NotImplemented
