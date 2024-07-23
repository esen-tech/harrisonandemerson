from typing import List

from sqlalchemy import select
from sqlalchemy.orm import joinedload

from modules.domain.types import Reference
from modules.web_server.schemas.user import CurrentInternalUserSchema
from services.iam.domain.models.internal_user import InternalUser
from services.iam.domain.models.internal_user_access_token import (
    InternalUserAccessToken,
)
from services.iam.domain.models.team import Team
from services.iam.domain.models.team_internal_user import TeamInternalUser
from services.iam.domain.models.team_permission import TeamPermission
from services.iam.service_layer.unit_of_work import SqlAlchemyUnitOfWork
from services.iam.web_server.schemas.internal_user import (
    RetrieveInternalUserDetailSchema,
    RetrieveInternalUserSummarySchema,
)


async def get_internal_user_by_access_token_value(
    uow: SqlAlchemyUnitOfWork, access_token_value: str
) -> CurrentInternalUserSchema:
    async with uow:
        statement = (
            select(InternalUserAccessToken)
            .join(InternalUserAccessToken.internal_user)
            .options(
                joinedload(InternalUserAccessToken.internal_user).options(
                    joinedload(InternalUser.team_internal_users).options(
                        joinedload(TeamInternalUser.team).options(
                            joinedload(Team.team_permissions).options(
                                joinedload(TeamPermission.permission)
                            )
                        )
                    )
                )
            )
            .where(InternalUserAccessToken.value == access_token_value)
        )
        result = await uow.session.execute(statement)
        entity = result.scalars().unique().first()
        if entity is None:
            return None
        organization_identifier_keys_map = {
            tiu.team.organization_reference: []
            for tiu in entity.internal_user.team_internal_users
        }
        for tiu in entity.internal_user.team_internal_users:
            for tp in tiu.team.team_permissions:
                organization_identifier_keys_map[
                    tiu.team.organization_reference
                ].append(tp.permission.identifier_key)

        return CurrentInternalUserSchema(
            reference=entity.internal_user.reference,
            organization_identifier_keys_map=organization_identifier_keys_map,
        )


async def get_internal_user_by_reference(
    uow: SqlAlchemyUnitOfWork, reference: Reference
) -> RetrieveInternalUserDetailSchema:
    async with uow:
        entry = await uow.internal_user_repository.get_by_reference(reference)
        return RetrieveInternalUserDetailSchema.from_orm(entry)


async def get_internal_users_by_references(
    uow: SqlAlchemyUnitOfWork, references: List[Reference]
) -> RetrieveInternalUserSummarySchema:
    async with uow:
        statement = select(InternalUser).where(InternalUser.reference.in_(references))
        result = await uow.session.execute(statement)
        entities = result.scalars().all()
        return [
            RetrieveInternalUserSummarySchema.from_orm(entity) for entity in entities
        ]
