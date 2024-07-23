from fastapi import APIRouter, Depends

from modules.domain.types import Reference
from modules.service_layer.message_bus import MessageBus
from modules.web_server.dependencies.auth import (
    internal_user_identifier_keys_required,
    internal_user_login_required,
)
from modules.web_server.schemas.server import ResponseSchema, StatusEnum
from services.iam.domain import command
from services.iam.web_server.dependencies.message_bus import get_message_bus
from services.iam.web_server.schemas.team import RetrieveTeamDetailSchema
from services.iam.web_server.schemas.team_permission import (
    UpdateTeamTeamPermissionsSchema,
)

router = APIRouter()


@router.put(
    "/organizations/{organization_reference}/teams/{team_reference}/team_permissions",
    tags=["team"],
    dependencies=[
        Depends(internal_user_login_required),
        Depends(internal_user_identifier_keys_required({"PERMISSION_EDITOR"})),
    ],
    response_model=ResponseSchema[RetrieveTeamDetailSchema],
)
async def update_organization_team_team_permissions(
    organization_reference: Reference,
    team_reference: Reference,
    payload: UpdateTeamTeamPermissionsSchema,
    bus: MessageBus = Depends(get_message_bus),
):
    cmd = command.UpdateTeamTeamPermissions(
        team_reference=team_reference,
        payload=payload,
    )
    await bus.handle(cmd)
    return ResponseSchema(status=StatusEnum.SUCCESS)
