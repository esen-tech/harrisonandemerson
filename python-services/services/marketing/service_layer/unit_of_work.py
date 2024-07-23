from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from modules.database.database import Database
from modules.service_layer.unit_of_work import AbstractUnitOfWork
from services.marketing.adapter.repositories.cooperation_code import (
    CooperationCodeRepository,
)
from services.marketing.adapter.repositories.end_user_care_product_referral_code import (
    EndUserCareProductReferralCodeRepository,
)
from services.marketing.adapter.repositories.promo_code import PromoCodeRepository


class SqlAlchemyUnitOfWork(AbstractUnitOfWork):
    def __init__(self, database: Database):
        self._database = database

    async def __aenter__(self) -> SqlAlchemyUnitOfWork:
        async_session = self._database.get_async_session()
        async with async_session() as session:
            self.session: AsyncSession = session
            self.cooperation_code_repository = CooperationCodeRepository(session)
            self.end_user_care_product_referral_code_repository = (
                EndUserCareProductReferralCodeRepository(session)
            )
            self.promo_code_repository = PromoCodeRepository(session)
            await super().__aenter__()
            return self

    async def __aexit__(self, *args):
        await super().__aexit__(*args)
        await self.session.close()

    async def _commit(self):
        await self.session.commit()

    async def rollback(self):
        await self.session.rollback()
