from modules.adapter.repository import SqlAlchemyRepository
from modules.domain.models.entity import Entity
from services.iam.domain.models.internal_user_access_token import (
    InternalUserAccessToken,
)


class InternalUserAccessTokenRepository(SqlAlchemyRepository[InternalUserAccessToken]):
    @property
    def _model(self) -> Entity:
        return InternalUserAccessToken
