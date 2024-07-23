from typing import Type

from modules.adapter.repository import SqlAlchemyRepository
from services.iam.domain.models.end_user import EndUser


class EndUserRepository(SqlAlchemyRepository[EndUser]):
    @property
    def _model(self) -> Type[EndUser]:
        return EndUser
