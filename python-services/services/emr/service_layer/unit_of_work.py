from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from modules.database.database import Database
from modules.service_layer.unit_of_work import AbstractUnitOfWork
from services.emr.adapter.repositories.care_case import CareCaseRepository
from services.emr.adapter.repositories.examination_report import (
    ExaminationReportRepository,
)
from services.emr.adapter.repositories.file import FileRepository


class SqlAlchemyUnitOfWork(AbstractUnitOfWork):
    def __init__(self, database: Database):
        self._database = database

    async def __aenter__(self) -> SqlAlchemyUnitOfWork:
        async_session = self._database.get_async_session()
        async with async_session() as session:
            self.session: AsyncSession = session
            self.examination_report_repository = ExaminationReportRepository(session)
            self.care_case_repository = CareCaseRepository(session)
            self.file_repository = FileRepository(session)
            await super().__aenter__()
            return self

    async def __aexit__(self, *args):
        await super().__aexit__(*args)
        await self.session.close()

    async def _commit(self):
        await self.session.commit()

    async def rollback(self):
        await self.session.rollback()
