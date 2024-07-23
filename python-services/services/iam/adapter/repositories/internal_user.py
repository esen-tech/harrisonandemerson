from modules.adapter.repository import SqlAlchemyRepository
from modules.domain.models.entity import Entity
from services.iam.domain.models.internal_user import InternalUser


class InternalUserRepository(SqlAlchemyRepository[InternalUser]):
    @property
    def _model(self) -> Entity:
        return InternalUser
