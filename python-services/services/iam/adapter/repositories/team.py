from sqlalchemy.orm import joinedload
from sqlalchemy.sql import expression

from modules.adapter.repository import SqlAlchemyRepository
from modules.domain.models.entity import Entity
from services.iam.domain.models.team import Team
from services.iam.domain.models.team_internal_user import TeamInternalUser
from services.iam.domain.models.team_permission import TeamPermission


class TeamRepository(SqlAlchemyRepository[Team]):
    @property
    def _model(self) -> Entity:
        return Team

    def get_enhanced_select_statement(
        self, statement: expression.select
    ) -> expression.select:
        return statement.options(
            joinedload(Team.organization),
            joinedload(Team.team_permissions).options(
                joinedload(TeamPermission.permission)
            ),
            joinedload(Team.team_internal_users).options(
                joinedload(TeamInternalUser.internal_user)
            ),
        )
