from typing import AsyncIterator, List

from sqlalchemy import select
from sqlalchemy.orm import joinedload

from modules.domain.types import Reference
from modules.domain.views.view_enhancer import EnhancedViewSchema, ViewEnhancement
from modules.web_server.schemas.user import CurrentEndUserSchema
from services.iam.domain.models.end_user import EndUser
from services.iam.domain.models.end_user_access_token import EndUserAccessToken
from services.iam.service_layer.unit_of_work import SqlAlchemyUnitOfWork
from services.iam.utils import split_name
from services.iam.web_server.schemas.end_user import RetrieveEndUserSummarySchema


async def get_end_users_by_references(
    uow: SqlAlchemyUnitOfWork, references: List[Reference]
) -> AsyncIterator[EndUser]:
    async with uow:
        entities = await uow.end_user_repository.get_all_by(
            EndUser.reference.in_(references)
        )
        yield entities


async def get_end_user_by_access_token_value(
    uow: SqlAlchemyUnitOfWork, access_token_value: str
) -> CurrentEndUserSchema | None:
    async with uow:
        statement = (
            select(EndUserAccessToken)
            .options(joinedload(EndUserAccessToken.end_user))
            .where(EndUserAccessToken.value == access_token_value)
        )
        result = await uow.session.execute(statement)
        entry = result.scalars().first()
        if entry is None:
            return None
        return CurrentEndUserSchema.from_orm(entry.end_user)


async def get_end_user_by_reference(
    uow: SqlAlchemyUnitOfWork, reference: Reference
) -> AsyncIterator[EndUser]:
    async with uow:
        entity = await uow.end_user_repository.get_by_reference(reference)
        yield entity


async def get_end_user_by_clinic_airtable_reference(
    uow: SqlAlchemyUnitOfWork, airtable_reference: str
) -> AsyncIterator[EndUser]:
    async with uow:
        entity = await uow.end_user_repository.get_by(
            airtable_reference=airtable_reference
        )
        yield entity


async def get_end_user_by_care_airtable_reference(
    uow: SqlAlchemyUnitOfWork, airtable_reference: str
) -> AsyncIterator[EndUser]:
    async with uow:
        entity = await uow.end_user_repository.get_by(
            care_airtable_reference=airtable_reference
        )
        yield entity


async def get_end_user_by_full_name_and_phone_number(
    uow: SqlAlchemyUnitOfWork, full_name: str, phone_number: str
) -> AsyncIterator[EndUser | None]:
    first_name, last_name = split_name(full_name)
    async with uow:
        entity = await uow.end_user_repository.get_by(
            first_name=first_name, last_name=last_name, phone_number=phone_number
        )
        yield entity


async def get_end_users_by_filter_and_page(
    uow: SqlAlchemyUnitOfWork,
    filter_view_enhancement: ViewEnhancement,
    page_view_enhancement: ViewEnhancement,
) -> EnhancedViewSchema[List[RetrieveEndUserSummarySchema]]:
    async with uow:
        enhanced_entities = await uow.end_user_repository.get_all_by_view_enhancements(
            [filter_view_enhancement, page_view_enhancement]
        )
        count = await uow.end_user_repository.get_count_by_view_enhancements(
            [filter_view_enhancement]
        )
        return EnhancedViewSchema[List[RetrieveEndUserSummarySchema]](
            enhanced_data=[
                RetrieveEndUserSummarySchema.from_orm(entry)
                for entry in enhanced_entities
            ],
            metadata={
                "page": page_view_enhancement.enhancer.get_metadata(
                    context=page_view_enhancement.context,
                    enhanced_entities=enhanced_entities,
                    count_all_page=count,
                ),
            },
        )
