from modules.web_server.schemas.system import CurrentServiceSchema
from services.iam.domain.models.service_access_token import ServiceAccessToken
from services.iam.service_layer.unit_of_work import SqlAlchemyUnitOfWork
from sqlalchemy import select
from sqlalchemy.orm import joinedload


async def get_service_by_access_token_value(
    uow: SqlAlchemyUnitOfWork, access_token_value: str
) -> CurrentServiceSchema:
    async with uow:
        statement = (
            select(ServiceAccessToken)
            .options(joinedload(ServiceAccessToken.service))
            .where(ServiceAccessToken.value == access_token_value)
        )
        result = await uow.session.execute(statement)
        entry = result.scalars().first()
        return CurrentServiceSchema(reference=entry.service.reference)
