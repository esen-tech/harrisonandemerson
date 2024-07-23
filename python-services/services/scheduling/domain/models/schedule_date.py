from dataclasses import dataclass

from modules.domain.models.entity import Entity
from modules.domain.types import Date


@dataclass(kw_only=True)
class ScheduleDate(Entity):
    date: Date
