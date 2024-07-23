from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from modules.database.database import Database
from modules.service_layer.unit_of_work import AbstractUnitOfWork
from services.iam.adapter.repositories.end_user import EndUserRepository
from services.iam.adapter.repositories.end_user_access_token import (
    EndUserAccessTokenRepository,
)
from services.iam.adapter.repositories.internal_user import InternalUserRepository
from services.iam.adapter.repositories.internal_user_access_token import (
    InternalUserAccessTokenRepository,
)
from services.iam.adapter.repositories.opt_token import OTPTokenRepository
from services.iam.adapter.repositories.organization import OrganizationRepository
from services.iam.adapter.repositories.organization_internal_user import (
    OrganizationInternalUserRepository,
)
from services.iam.adapter.repositories.permission import PermissionRepository
from services.iam.adapter.repositories.service import ServiceRepository
from services.iam.adapter.repositories.team import TeamRepository
from services.iam.adapter.repositories.team_internal_user import (
    TeamInternalUserRepository,
)


class SqlAlchemyUnitOfWork(AbstractUnitOfWork):
    def __init__(self, database: Database):
        self._database = database

    async def __aenter__(self) -> SqlAlchemyUnitOfWork:
        async_session = self._database.get_async_session()
        async with async_session() as session:
            self.session: AsyncSession = session
            self.organization_repository = OrganizationRepository(session)
            self.internal_user_repository = InternalUserRepository(session)
            self.organization_internal_user_repository = (
                OrganizationInternalUserRepository(session)
            )
            self.team_internal_user_repository = TeamInternalUserRepository(session)
            self.team_repository = TeamRepository(session)
            self.permission_repository = PermissionRepository(session)
            self.end_user_repository = EndUserRepository(session)
            self.internal_user_access_token_repository = (
                InternalUserAccessTokenRepository(session)
            )
            self.end_user_access_token_repository = EndUserAccessTokenRepository(
                session
            )
            self.otp_token_repository = OTPTokenRepository(session)
            self.service_repository = ServiceRepository(session)
            await super().__aenter__()
            return self

    async def __aexit__(self, *args):
        await super().__aexit__(*args)
        await self.session.close()

    async def _commit(self):
        await self.session.commit()

    async def rollback(self):
        await self.session.rollback()
