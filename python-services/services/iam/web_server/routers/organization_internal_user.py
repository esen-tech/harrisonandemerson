from typing import List

from fastapi import APIRouter, Depends

from modules.domain.types import Reference
from modules.domain.views.view_enhancer import EnhancedViewSchema, ViewEnhancement
from modules.service_layer.message_bus import MessageBus
from modules.web_server.dependencies.auth import (
    internal_user_identifier_keys_required,
    internal_user_login_required,
)
from modules.web_server.schemas.server import ResponseSchema, StatusEnum
from services.iam.domain.views import (
    organization_internal_user as organization_internal_user_views,
)
from services.iam.domain.views.filter_view_enhancer import (
    organization_internal_user_filter_view_enhancer,
)
from services.iam.domain.views.page_view_enhancer import (
    organization_internal_user_page_view_enhancer,
)
from services.iam.web_server.dependencies.message_bus import get_message_bus
from services.iam.web_server.schemas.organization_internal_user import (
    RetrieveOrganizationInternalUserSummarySchema,
)

router = APIRouter()


@router.get(
    "/organizations/{organization_reference}/organization_internal_users",
    tags=["organization_internal_user"],
    dependencies=[
        Depends(internal_user_login_required),
        Depends(internal_user_identifier_keys_required({"INTERNAL_USER_READER"})),
    ],
    response_model=ResponseSchema[
        EnhancedViewSchema[List[RetrieveOrganizationInternalUserSummarySchema]]
    ],
)
async def get_organization_organization_internal_users(
    organization_reference: Reference,
    filter_context=Depends(organization_internal_user_filter_view_enhancer.get_context),
    page_context=Depends(organization_internal_user_page_view_enhancer.get_context),
    bus: MessageBus = Depends(get_message_bus),
):
    async for enhanced_entities, page_metadata in organization_internal_user_views.get_organization_internal_users_and_page_metadata_by_filter_and_page_and_organization_reference(
        bus.uow,
        ViewEnhancement(
            enhancer=organization_internal_user_filter_view_enhancer,
            context=filter_context,
        ),
        ViewEnhancement(
            enhancer=organization_internal_user_page_view_enhancer, context=page_context
        ),
        organization_reference,
    ):
        return ResponseSchema[
            EnhancedViewSchema[List[RetrieveOrganizationInternalUserSummarySchema]]
        ](
            status=StatusEnum.SUCCESS,
            data=EnhancedViewSchema(
                enhanced_data=[
                    RetrieveOrganizationInternalUserSummarySchema.from_orm(entity)
                    for entity in enhanced_entities
                ],
                metadata={"page": page_metadata},
            ),
        )
