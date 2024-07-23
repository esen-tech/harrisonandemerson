from typing import AsyncIterator, List

from sqlalchemy import select

from modules.domain.types import Reference
from services.iam.domain.models.organization import Organization
from services.iam.domain.models.team import Team
from services.iam.domain.models.team_internal_user import TeamInternalUser
from services.iam.service_layer.unit_of_work import SqlAlchemyUnitOfWork
from services.iam.web_server.schemas.organization import (
    RetrieveOrganizationSummarySchema,
)


async def get_organization_by_reference(
    uow: SqlAlchemyUnitOfWork, reference: Reference
) -> AsyncIterator[Organization]:
    async with uow:
        entity = await uow.organization_repository.get_by_reference(reference)
        yield entity


async def get_organizations_by_internal_user_reference(
    uow: SqlAlchemyUnitOfWork, internal_user_reference: Reference
) -> List[RetrieveOrganizationSummarySchema]:
    async with uow:
        statement = (
            select(Organization)
            .join(Organization.teams)
            .join(Team.team_internal_users)
            .where(TeamInternalUser.internal_user_reference == internal_user_reference)
        )
        result = await uow.session.execute(statement)
        entries = result.scalars().unique().all()
        return [RetrieveOrganizationSummarySchema.from_orm(entry) for entry in entries]


async def get_organizations_by_references(
    uow: SqlAlchemyUnitOfWork, references: List[Reference]
) -> RetrieveOrganizationSummarySchema:
    async with uow:
        statement = select(Organization).where(Organization.reference.in_(references))
        result = await uow.session.execute(statement)
        entities = result.scalars().all()
        return [
            RetrieveOrganizationSummarySchema.from_orm(entity) for entity in entities
        ]
