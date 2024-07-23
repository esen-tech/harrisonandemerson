from typing import Type

from sqlalchemy.orm import joinedload
from sqlalchemy.sql import expression

from modules.adapter.repository import SqlAlchemyRepository
from services.iam.domain.models.team_internal_user import TeamInternalUser


class TeamInternalUserRepository(SqlAlchemyRepository[TeamInternalUser]):
    @property
    def _model(self) -> Type[TeamInternalUser]:
        return TeamInternalUser

    def get_enhanced_select_statement(
        self, statement: expression.select
    ) -> expression.select:
        return statement.options(joinedload(TeamInternalUser.internal_user))
