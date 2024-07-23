from modules.domain.models.value_object import ValueObject
from modules.domain.types import DateTime


class TimeSlot(ValueObject):
    start_time: DateTime
    end_time: DateTime
