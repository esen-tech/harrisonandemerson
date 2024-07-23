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
from services.iam.web_server.schemas.team_internal_user import (
    CreateTeamInternalUserSchema,
)

router = APIRouter()


@router.post(
    "/organizations/{organization_reference}/teams/{team_reference}/team_internal_users",
    tags=["team_internal_user"],
    dependencies=[
        Depends(internal_user_login_required),
        Depends(internal_user_identifier_keys_required({"TEAM_EDITOR"})),
    ],
    response_model=ResponseSchema,
)
async def create_organization_team_team_internal_user(
    organization_reference: Reference,
    team_reference: Reference,
    payload: CreateTeamInternalUserSchema,
    bus: MessageBus = Depends(get_message_bus),
):
    cmd = command.CreateTeamInternalUser(
        team_reference=team_reference,
        payload=payload,
    )
    await bus.handle(cmd)
    return ResponseSchema(status=StatusEnum.SUCCESS)


@router.delete(
    "/organizations/{organization_reference}/teams/{team_reference}/team_internal_users/{team_internal_user_reference}",
    tags=["team_internal_user"],
    dependencies=[
        Depends(internal_user_login_required),
        Depends(internal_user_identifier_keys_required({"TEAM_EDITOR"})),
    ],
    response_model=ResponseSchema,
)
async def delete_organization_team_team_internal_user(
    organization_reference: Reference,
    team_reference: Reference,
    team_internal_user_reference: Reference,
    bus: MessageBus = Depends(get_message_bus),
):
    cmd = command.DeleteTeamInternalUser(
        team_internal_user_reference=team_internal_user_reference,
    )
    await bus.handle(cmd)
    return ResponseSchema(status=StatusEnum.SUCCESS)
