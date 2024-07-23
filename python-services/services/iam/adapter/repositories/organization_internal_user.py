from sqlalchemy.orm import joinedload
from sqlalchemy.sql import expression

from modules.adapter.repository import SqlAlchemyRepository
from modules.domain.models.entity import Entity
from services.iam.domain.models.internal_user import InternalUser
from services.iam.domain.models.organization_internal_user import (
    OrganizationInternalUser,
)
from services.iam.domain.models.team import Team
from services.iam.domain.models.team_internal_user import TeamInternalUser


class OrganizationInternalUserRepository(
    SqlAlchemyRepository[OrganizationInternalUser]
):
    @property
    def _model(self) -> Entity:
        return OrganizationInternalUser

    def get_enhanced_select_statement(
        self, statement: expression.select
    ) -> expression.select:
        return statement.options(
            joinedload(OrganizationInternalUser.internal_user).options(
                joinedload(InternalUser.team_internal_users).options(
                    joinedload(TeamInternalUser.team).options(
                        joinedload(Team.organization)
                    )
                )
            )
        )
