from typing import Type

from modules.adapter.repository import SqlAlchemyRepository
from services.marketing.domain.models.cooperation_code import CooperationCode


class CooperationCodeRepository(SqlAlchemyRepository[CooperationCode]):
    @property
    def _model(self) -> Type[CooperationCode]:
        return CooperationCode
