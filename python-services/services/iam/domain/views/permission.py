from typing import List

from sqlalchemy import select
from sqlalchemy.orm import joinedload

from modules.domain.types import Reference
from services.iam.domain.models.internal_user import InternalUser
from services.iam.domain.models.permission import Permission
from services.iam.domain.models.team import Team
from services.iam.domain.models.team_internal_user import TeamInternalUser
from services.iam.domain.models.team_permission import TeamPermission
from services.iam.service_layer.unit_of_work import SqlAlchemyUnitOfWork
from services.iam.web_server.schemas.permission import RetrievePermissionSummarySchema


async def get_permissions(uow: SqlAlchemyUnitOfWork) -> List[Permission]:
    async with uow:
        permissions = await uow.permission_repository.get_all_by()
        yield permissions


async def get_permissions_by_internal_user_reference(
    uow: SqlAlchemyUnitOfWork, internal_user_reference: Reference
) -> List[RetrievePermissionSummarySchema]:
    async with uow:
        statement = (
            select(InternalUser)
            .options(
                joinedload(InternalUser.team_internal_users).options(
                    joinedload(TeamInternalUser.team).options(
                        joinedload(Team.team_permissions).options(
                            joinedload(TeamPermission.permission)
                        )
                    )
                )
            )
            .where(InternalUser.reference == internal_user_reference)
        )
        result = await uow.session.execute(statement)
        internal_user = result.scalars().first()
        return [
            RetrievePermissionSummarySchema.from_orm(tp.permission)
            for tiu in internal_user.team_internal_users
            for tp in tiu.team.team_permissions
        ]
