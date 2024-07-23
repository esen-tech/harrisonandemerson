from typing import AsyncIterator, List

from modules.domain.types import Reference
from services.marketing.domain.models.cooperation_code import CooperationCode
from services.marketing.service_layer.unit_of_work import SqlAlchemyUnitOfWork


async def get_cooperation_codes(
    uow: SqlAlchemyUnitOfWork,
) -> AsyncIterator[List[CooperationCode]]:
    async with uow:
        entities = await uow.cooperation_code_repository.get_all_by()
        yield entities


async def get_cooperation_code_by_cooperation_code_reference(
    uow: SqlAlchemyUnitOfWork, cooperation_code_reference: Reference
) -> AsyncIterator[CooperationCode | None]:
    async with uow:
        entity = await uow.cooperation_code_repository.get_by_reference(
            cooperation_code_reference
        )
        yield entity


async def get_cooperation_code_by_cooperation_code_code(
    uow: SqlAlchemyUnitOfWork, cooperation_code_code: str
) -> AsyncIterator[CooperationCode | None]:
    async with uow:
        entity = await uow.cooperation_code_repository.get_by(
            code=cooperation_code_code
        )
        yield entity
