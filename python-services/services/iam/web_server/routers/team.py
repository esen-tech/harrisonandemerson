import uuid
from typing import List

from fastapi import APIRouter, Depends

from modules.domain.types import Reference
from modules.domain.views.filter_view_enhancer import FilterContextSchema
from modules.domain.views.view_enhancer import EnhancedViewSchema, ViewEnhancement
from modules.service_layer.message_bus import MessageBus
from modules.web_server.dependencies.auth import (
    internal_user_identifier_keys_required,
    internal_user_login_required,
)
from modules.web_server.schemas.server import ResponseSchema, StatusEnum
from services.iam.domain import command
from services.iam.domain.views import team as team_views
from services.iam.domain.views.filter_view_enhancer import (
    TeamFilterEnum,
    team_filter_view_enhancer,
)
from services.iam.domain.views.page_view_enhancer import team_page_view_enhancer
from services.iam.web_server.dependencies.message_bus import get_message_bus
from services.iam.web_server.schemas.team import (
    CreateTeamByInternalUserSchema,
    RetrieveTeamDetailSchema,
    RetrieveTeamSummarySchema,
    UpdateTeamByInternalUserSchema,
)

router = APIRouter()


@router.post(
    "/organizations/{organization_reference}/teams",
    tags=["team"],
    dependencies=[
        Depends(internal_user_login_required),
        Depends(internal_user_identifier_keys_required({"TEAM_EDITOR"})),
    ],
    response_model=ResponseSchema,
)
async def create_organization_team(
    organization_reference: Reference,
    payload: CreateTeamByInternalUserSchema,
    bus: MessageBus = Depends(get_message_bus),
):
    reference = uuid.uuid4()
    cmd = command.CreateTeamByInternalUser(
        reference=reference,
        organization_reference=organization_reference,
        payload=payload,
    )
    await bus.handle(cmd)
    return ResponseSchema(status=StatusEnum.SUCCESS)


@router.patch(
    "/organizations/{organization_reference}/teams/{team_reference}",
    tags=["team"],
    dependencies=[
        Depends(internal_user_login_required),
        Depends(internal_user_identifier_keys_required({"TEAM_EDITOR"})),
    ],
    response_model=ResponseSchema,
)
async def update_organization_team(
    organization_reference: Reference,
    team_reference: Reference,
    payload: UpdateTeamByInternalUserSchema,
    bus: MessageBus = Depends(get_message_bus),
):
    cmd = command.UpdateTeamByInternalUser(
        team_reference=team_reference,
        payload=payload,
    )
    await bus.handle(cmd)
    return ResponseSchema(status=StatusEnum.SUCCESS)


@router.get(
    "/organizations/{organization_reference}/teams",
    tags=["team"],
    dependencies=[
        Depends(internal_user_login_required),
        Depends(internal_user_identifier_keys_required({"TEAM_READER"})),
    ],
    response_model=ResponseSchema[EnhancedViewSchema[List[RetrieveTeamSummarySchema]]],
)
async def get_organization_teams(
    organization_reference: Reference,
    page_context=Depends(team_page_view_enhancer.get_context),
    bus: MessageBus = Depends(get_message_bus),
):
    async for enhanced_entities, page_metadata in team_views.get_teams_and_page_metadata_by_filter_and_page_and_organization_reference(
        bus.uow,
        ViewEnhancement(
            enhancer=team_filter_view_enhancer,
            context=FilterContextSchema(
                type=TeamFilterEnum.ORGANIZATION_REFERENCE.value,
                query=organization_reference,
            ),
        ),
        ViewEnhancement(enhancer=team_page_view_enhancer, context=page_context),
        organization_reference,
    ):
        return ResponseSchema[EnhancedViewSchema[List[RetrieveTeamSummarySchema]]](
            status=StatusEnum.SUCCESS,
            data=EnhancedViewSchema(
                enhanced_data=[
                    RetrieveTeamSummarySchema.from_orm(entity)
                    for entity in enhanced_entities
                ],
                metadata={"page": page_metadata},
            ),
        )


@router.get(
    "/organizations/{organization_reference}/teams/{team_reference}",
    tags=["team"],
    dependencies=[
        Depends(internal_user_login_required),
        Depends(internal_user_identifier_keys_required({"TEAM_READER"})),
    ],
    response_model=ResponseSchema[RetrieveTeamDetailSchema],
)
async def get_organization_team_detail(
    organization_reference: Reference,
    team_reference: Reference,
    bus: MessageBus = Depends(get_message_bus),
):
    async for entity in team_views.get_by_team_reference(bus.uow, team_reference):
        return ResponseSchema[RetrieveTeamDetailSchema](
            status=StatusEnum.SUCCESS, data=RetrieveTeamDetailSchema.from_orm(entity)
        )


@router.delete(
    "/organizations/{organization_reference}/teams/{team_reference}",
    tags=["team"],
    dependencies=[
        Depends(internal_user_login_required),
        Depends(internal_user_identifier_keys_required({"TEAM_EDITOR"})),
    ],
    response_model=ResponseSchema,
)
async def delete_organization_team_detail(
    organization_reference: Reference,
    team_reference: Reference,
    bus: MessageBus = Depends(get_message_bus),
):
    cmd = command.DeleteTeamByInternalUser(team_reference=team_reference)
    await bus.handle(cmd)
    return ResponseSchema(status=StatusEnum.SUCCESS)
