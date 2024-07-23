from dataclasses import dataclass

from modules.domain.types import DateTime


@dataclass(kw_only=True)
class AbstractToken:
    value: str
    expiration_time: DateTime
    is_active: bool
