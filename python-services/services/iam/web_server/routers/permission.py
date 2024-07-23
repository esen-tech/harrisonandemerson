from typing import List

from fastapi import APIRouter, Depends

from modules.service_layer.message_bus import MessageBus
from modules.web_server.dependencies.auth import (
    get_current_internal_user,
    internal_user_login_required,
)
from modules.web_server.schemas.server import ResponseSchema, StatusEnum
from modules.web_server.schemas.user import CurrentInternalUserSchema
from services.iam.domain.views import permission as permission_views
from services.iam.web_server.dependencies.message_bus import get_message_bus
from services.iam.web_server.schemas.permission import RetrievePermissionSummarySchema

router = APIRouter()


@router.get(
    "/permissions",
    tags=["permission"],
    response_model=ResponseSchema[List[RetrievePermissionSummarySchema]],
)
async def get_permissions(
    bus: MessageBus = Depends(get_message_bus),
):
    async for entities in permission_views.get_permissions(bus.uow):
        return ResponseSchema[List[RetrievePermissionSummarySchema]](
            status=StatusEnum.SUCCESS,
            data=[
                RetrievePermissionSummarySchema.from_orm(entity) for entity in entities
            ],
        )


@router.get(
    "/internal_users/me/permissions",
    tags=["permission"],
    dependencies=[Depends(internal_user_login_required)],
    response_model=ResponseSchema[List[RetrievePermissionSummarySchema]],
)
async def get_current_internal_user_permissions(
    internal_user: CurrentInternalUserSchema = Depends(get_current_internal_user),
    bus: MessageBus = Depends(get_message_bus),
):
    data = await permission_views.get_permissions_by_internal_user_reference(
        bus.uow, internal_user.reference
    )
    return ResponseSchema[List[RetrievePermissionSummarySchema]](
        status=StatusEnum.SUCCESS,
        data=data,
    )
