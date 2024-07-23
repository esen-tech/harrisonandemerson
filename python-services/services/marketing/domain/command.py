from dataclasses import dataclass

from modules.domain.command import Command
from modules.domain.types import Reference
from services.marketing.web_server.schemas.cooperation_code import (
    CreateCooperationCodeSchema,
)
from services.marketing.web_server.schemas.promo_code import (
    CreatePromoCodeByInternalUserSchema,
)


@dataclass
class CreateCooperationCode(Command):
    reference: Reference
    payload: CreateCooperationCodeSchema


@dataclass
class DeleteCooperationCode(Command):
    reference: Reference


@dataclass
class CreatePromoCodeByInternalUser(Command):
    promo_code_reference: Reference
    payload: CreatePromoCodeByInternalUserSchema


@dataclass
class DeletePromoCodeByInternalUser(Command):
    promo_code_reference: Reference
