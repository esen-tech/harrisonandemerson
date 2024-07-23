from typing import Any

from modules.domain.event import Event
from pydantic import BaseModel


class MessageBodySchema(BaseModel):
    pass


class EventMessageBodySchema(MessageBodySchema):
    event_name: str
    event: dict
