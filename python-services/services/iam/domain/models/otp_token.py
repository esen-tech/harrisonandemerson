from dataclasses import dataclass

from modules.domain.models.entity import Entity
from services.iam.domain.models.abstract_token import AbstractToken


@dataclass(kw_only=True)
class OTPToken(AbstractToken, Entity):
    serial_number: str | None = None
    state: str | None = None
