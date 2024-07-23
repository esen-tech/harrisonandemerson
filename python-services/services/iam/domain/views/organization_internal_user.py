from typing import AsyncIterator, List, Tuple

from modules.domain.types import Reference
from modules.domain.views.page_view_enhancer import PageMetadataSchema
from modules.domain.views.view_enhancer import ViewEnhancement
from services.iam.domain.models.organization_internal_user import (
    OrganizationInternalUser,
)
from services.iam.service_layer.unit_of_work import SqlAlchemyUnitOfWork


async def get_organization_internal_users_and_page_metadata_by_filter_and_page_and_organization_reference(
    uow: SqlAlchemyUnitOfWork,
    filter_view_enhancement: ViewEnhancement,
    page_view_enhancement: ViewEnhancement,
    organization_reference: Reference,
) -> AsyncIterator[Tuple[List[OrganizationInternalUser], PageMetadataSchema]]:
    async with uow:
        organization_internal_users = (
            await uow.organization_internal_user_repository.get_all_by(
                organization_reference=organization_reference,
                view_enhancements=[filter_view_enhancement, page_view_enhancement],
            )
        )
        count = await uow.organization_internal_user_repository.get_count_by(
            view_enhancements=[filter_view_enhancement]
        )
        yield organization_internal_users, page_view_enhancement.enhancer.get_metadata(
            context=page_view_enhancement.context,
            enhanced_entities=organization_internal_users,
            count_all_page=count,
        )
