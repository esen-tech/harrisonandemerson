import uuid
from typing import List

from fastapi import APIRouter, Depends

from modules.domain.types import Reference
from modules.service_layer.message_bus import MessageBus
from modules.web_server.dependencies.auth import (
    internal_user_identifier_keys_required,
    internal_user_login_required,
)
from modules.web_server.exceptions import EsenBadRequestError
from modules.web_server.schemas.server import ResponseSchema, StatusEnum
from services.marketing.domain import command
from services.marketing.domain.views import cooperation_code as cooperation_code_views
from services.marketing.service_layer.handlers import DuplicateCooperationCodeCode
from services.marketing.web_server.dependencies.message_bus import get_message_bus
from services.marketing.web_server.schemas.cooperation_code import (
    CreateCooperationCodeSchema,
    RetrieveCooperationCodeDetailSchema,
    RetrieveCooperationCodeSummarySchema,
)

router = APIRouter()


@router.post(
    "/organizations/{organization_reference}/cooperation_codes",
    tags=["cooperation_code"],
    dependencies=[
        Depends(internal_user_login_required),
        Depends(internal_user_identifier_keys_required({"MARKETING_EDITOR"})),
    ],
    response_model=ResponseSchema[RetrieveCooperationCodeSummarySchema],
)
async def create_cooperation_code(
    organization_reference: Reference,
    payload: CreateCooperationCodeSchema,
    bus: MessageBus = Depends(get_message_bus),
):
    reference = uuid.uuid4()
    try:
        cmd = command.CreateCooperationCode(
            reference=reference,
            payload=payload,
        )
        await bus.handle(cmd)
    except DuplicateCooperationCodeCode as e:
        raise EsenBadRequestError(e)
    return ResponseSchema[RetrieveCooperationCodeSummarySchema](
        status=StatusEnum.SUCCESS,
        data=RetrieveCooperationCodeSummarySchema(
            reference=reference,
            code=payload.code,
            expiration_time=payload.expiration_time,
            entity_name=payload.entity_name,
        ),
    )


@router.get(
    "/organizations/{organization_reference}/cooperation_codes",
    tags=["cooperation_code"],
    dependencies=[
        Depends(internal_user_login_required),
        Depends(internal_user_identifier_keys_required({"MARKETING_READER"})),
    ],
    response_model=ResponseSchema[List[RetrieveCooperationCodeSummarySchema]],
)
async def get_cooperation_codes(
    organization_reference: Reference,
    bus: MessageBus = Depends(get_message_bus),
):
    async for entities in cooperation_code_views.get_cooperation_codes(bus.uow):
        return ResponseSchema[List[RetrieveCooperationCodeSummarySchema]](
            status=StatusEnum.SUCCESS,
            data=[
                RetrieveCooperationCodeSummarySchema.from_orm(entity)
                for entity in entities
            ],
        )


@router.get(
    "/organizations/{organization_reference}/cooperation_codes/{cooperation_code_reference}",
    tags=["cooperation_code"],
    dependencies=[
        Depends(internal_user_login_required),
        Depends(internal_user_identifier_keys_required({"MARKETING_READER"})),
    ],
    response_model=ResponseSchema[RetrieveCooperationCodeDetailSchema],
)
async def get_cooperation_code(
    organization_reference: Reference,
    cooperation_code_reference: Reference,
    bus: MessageBus = Depends(get_message_bus),
):
    async for entity in cooperation_code_views.get_cooperation_code_by_cooperation_code_reference(
        bus.uow, cooperation_code_reference
    ):
        return ResponseSchema[RetrieveCooperationCodeDetailSchema](
            status=StatusEnum.SUCCESS,
            data=RetrieveCooperationCodeDetailSchema.from_orm(entity),
        )


@router.delete(
    "/organizations/{organization_reference}/cooperation_codes/{cooperation_code_reference}",
    tags=["cooperation_code"],
    dependencies=[
        Depends(internal_user_login_required),
        Depends(internal_user_identifier_keys_required({"MARKETING_EDITOR"})),
    ],
    response_model=ResponseSchema,
)
async def delete_cooperation_code(
    organization_reference: Reference,
    cooperation_code_reference: Reference,
    bus: MessageBus = Depends(get_message_bus),
):
    cmd = command.DeleteCooperationCode(reference=cooperation_code_reference)
    await bus.handle(cmd)
    return ResponseSchema(status=StatusEnum.SUCCESS)
