from dataclasses import dataclass

from modules.domain.models.entity import Entity
from services.iam.domain.models.abstract_token import AbstractToken
from services.iam.domain.models.end_user import EndUser


@dataclass(kw_only=True)
class EndUserAccessToken(AbstractToken, Entity):
    end_user: EndUser
