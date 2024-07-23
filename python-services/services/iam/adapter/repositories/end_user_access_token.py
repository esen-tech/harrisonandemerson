from modules.adapter.repository import SqlAlchemyRepository
from modules.domain.models.entity import Entity
from services.iam.domain.models.end_user_access_token import EndUserAccessToken


class EndUserAccessTokenRepository(SqlAlchemyRepository[EndUserAccessToken]):
    @property
    def _model(self) -> Entity:
        return EndUserAccessToken
