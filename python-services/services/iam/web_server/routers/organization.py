from typing import List

from fastapi import APIRouter, Depends, Query

from modules.domain.types import Reference
from modules.service_layer.message_bus import MessageBus
from modules.web_server.dependencies.auth import (
    get_current_internal_user,
    internal_user_identifier_keys_required,
    internal_user_login_required,
)
from modules.web_server.exceptions import EsenPermissionDeniedError
from modules.web_server.schemas.server import ResponseSchema, StatusEnum
from modules.web_server.schemas.user import CurrentInternalUserSchema
from services.iam.domain import command
from services.iam.domain.views import organization as organization_views
from services.iam.service_layer.handlers import InvalidOwner
from services.iam.web_server.dependencies.message_bus import get_message_bus
from services.iam.web_server.schemas.organization import (
    RetrieveOrganizationDetailSchema,
    RetrieveOrganizationSummarySchema,
    UpdateOrganizationSchema,
)

router = APIRouter()


@router.get(
    "/organizations/{organization_reference}",
    tags=["organization"],
    response_model=ResponseSchema[RetrieveOrganizationDetailSchema],
)
async def get_organization_detail(
    organization_reference: Reference,
    bus: MessageBus = Depends(get_message_bus),
):
    async for entity in organization_views.get_organization_by_reference(
        bus.uow, organization_reference
    ):
        return ResponseSchema[RetrieveOrganizationDetailSchema](
            status=StatusEnum.SUCCESS,
            data=RetrieveOrganizationDetailSchema.from_orm(entity),
        )


@router.get(
    "/internal_users/me/organizations",
    tags=["organization"],
    dependencies=[Depends(internal_user_login_required)],
    response_model=ResponseSchema[List[RetrieveOrganizationSummarySchema]],
)
async def get_current_internal_user_organizations(
    internal_user: CurrentInternalUserSchema = Depends(get_current_internal_user),
    bus: MessageBus = Depends(get_message_bus),
):
    data = await organization_views.get_organizations_by_internal_user_reference(
        bus.uow, internal_user.reference
    )
    return ResponseSchema[List[RetrieveOrganizationSummarySchema]](
        status=StatusEnum.SUCCESS,
        data=data,
    )


@router.get(
    "/organizations",
    tags=["organization"],
    response_model=ResponseSchema[List[RetrieveOrganizationSummarySchema]],
)
async def get_organizations(
    references: List[Reference] = Query(default=None),
    bus: MessageBus = Depends(get_message_bus),
):
    data = await organization_views.get_organizations_by_references(bus.uow, references)
    return ResponseSchema[List[RetrieveOrganizationSummarySchema]](
        status=StatusEnum.SUCCESS, data=data
    )


@router.patch(
    "/organizations/{organization_reference}",
    tags=["organization"],
    dependencies=[
        Depends(internal_user_login_required),
        Depends(internal_user_identifier_keys_required({"ORGANIZATION_EDITOR"})),
    ],
    response_model=ResponseSchema,
)
async def update_organization(
    organization_reference: Reference,
    payload: UpdateOrganizationSchema,
    internal_user: CurrentInternalUserSchema = Depends(get_current_internal_user),
    bus: MessageBus = Depends(get_message_bus),
):
    try:
        cmd = command.UpdateOrganizationByOwner(
            internal_user_reference=internal_user.reference,
            organization_reference=organization_reference,
            payload=payload,
        )
        await bus.handle(cmd)
    except InvalidOwner:
        raise EsenPermissionDeniedError("Forbidden")
    return ResponseSchema(status=StatusEnum.SUCCESS)
