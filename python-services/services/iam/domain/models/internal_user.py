from dataclasses import dataclass

from modules.domain.models.entity import Entity
from services.iam.domain.models.abstract_person import AbstractPerson


@dataclass(kw_only=True)
class InternalUser(AbstractPerson, Entity):
    email_address: str
    password_salt: str
    hashed_password: str
    avatar_src: str | None = None
    education: str | None = None
    biography: str | None = None
