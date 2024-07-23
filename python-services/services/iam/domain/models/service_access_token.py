from dataclasses import dataclass

from modules.domain.models.entity import Entity
from services.iam.domain.models.abstract_token import AbstractToken
from services.iam.domain.models.service import Service


@dataclass(kw_only=True)
class ServiceAccessToken(AbstractToken, Entity):
    service: Service
