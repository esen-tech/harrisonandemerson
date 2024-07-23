from dataclasses import dataclass

from modules.domain.models.entity import Entity
from services.iam.domain.models.abstract_token import AbstractToken
from services.iam.domain.models.internal_user import InternalUser


@dataclass(kw_only=True)
class InternalUserAccessToken(AbstractToken, Entity):
    internal_user: InternalUser
