from typing import List

from fastapi import APIRouter, Depends

from modules.domain.types import Reference
from modules.domain.views.view_enhancer import EnhancedViewSchema, ViewEnhancement
from modules.service_layer.message_bus import MessageBus
from modules.web_server.dependencies.auth import internal_user_login_required
from modules.web_server.schemas.server import ResponseSchema, StatusEnum
from services.scheduling.domain import command
from services.scheduling.domain.views import schedule as schedule_views
from services.scheduling.domain.views.page_view_enhancer import (
    schedule_page_view_enhancer,
)
from services.scheduling.web_server.dependencies.message_bus import get_message_bus
from services.scheduling.web_server.schemas.schedule import (
    CreateSchedulByInternalUserSchema,
    RetrieveScheduleDetailSchema,
    RetrieveScheduleSummarySchema,
    UpdateScheduleByInternalUserSchema,
)

router = APIRouter()


@router.post(
    "/organizations/{organization_reference}/schedules",
    tags=["schedule"],
    response_model=ResponseSchema,
)
async def create_schedule_by_internal_user(
    organization_reference: Reference,
    payload: CreateSchedulByInternalUserSchema,
    bus: MessageBus = Depends(get_message_bus),
):
    cmd = command.CreateSchedulByInternalUser(
        organization_reference=organization_reference,
        payload=payload,
    )
    await bus.handle(cmd)
    return ResponseSchema(status=StatusEnum.SUCCESS)


@router.get(
    "/organizations/{organization_reference}/schedules",
    tags=["schedule"],
    dependencies=[Depends(internal_user_login_required)],
    response_model=ResponseSchema[
        EnhancedViewSchema[List[RetrieveScheduleSummarySchema]]
    ],
)
async def get_organization_schedules(
    organization_reference: Reference,
    page_context=Depends(schedule_page_view_enhancer.get_context),
    bus: MessageBus = Depends(get_message_bus),
):
    async for enhanced_entities, page_metadata in schedule_views.get_schedules_and_page_metadata_by_page_and_organization_reference(
        bus.uow,
        ViewEnhancement(enhancer=schedule_page_view_enhancer, context=page_context),
        organization_reference,
    ):
        return ResponseSchema[EnhancedViewSchema[List[RetrieveScheduleSummarySchema]]](
            status=StatusEnum.SUCCESS,
            data=EnhancedViewSchema(
                enhanced_data=[
                    RetrieveScheduleSummarySchema.from_orm(entity)
                    for entity in enhanced_entities
                ],
                metadata={"page": page_metadata},
            ),
        )


@router.get(
    "/organizations/{organization_reference}/schedules/{schedule_reference}",
    tags=["team"],
    dependencies=[Depends(internal_user_login_required)],
    response_model=ResponseSchema[RetrieveScheduleDetailSchema],
)
async def get_organization_schedule_detail(
    organization_reference: Reference,
    schedule_reference: Reference,
    bus: MessageBus = Depends(get_message_bus),
):
    async for entity in schedule_views.get_by_schedule_reference(
        bus.uow, schedule_reference
    ):
        return ResponseSchema[RetrieveScheduleDetailSchema](
            status=StatusEnum.SUCCESS,
            data=RetrieveScheduleDetailSchema.from_orm(entity),
        )


@router.patch(
    "/organizations/{organization_reference}/schedules/{schedule_reference}",
    tags=["schedule"],
    dependencies=[Depends(internal_user_login_required)],
    response_model=ResponseSchema,
)
async def update_scheudle_by_internal_user(
    organization_reference: Reference,
    schedule_reference: Reference,
    payload: UpdateScheduleByInternalUserSchema,
    bus: MessageBus = Depends(get_message_bus),
):
    cmd = command.UpdateScheduleByInternalUser(
        schedule_reference=schedule_reference,
        payload=payload,
    )
    await bus.handle(cmd)
    return ResponseSchema(status=StatusEnum.SUCCESS)


@router.post(
    "/organizations/{organization_reference}/schedules/{schedule_reference}/publish",
    tags=["schedule"],
    dependencies=[Depends(internal_user_login_required)],
    response_model=ResponseSchema,
)
async def publish_scheudle_by_internal_user(
    organization_reference: Reference,
    schedule_reference: Reference,
    bus: MessageBus = Depends(get_message_bus),
):
    cmd = command.PublishScheduleByInternalUser(schedule_reference=schedule_reference)
    await bus.handle(cmd)
    return ResponseSchema(status=StatusEnum.SUCCESS)
