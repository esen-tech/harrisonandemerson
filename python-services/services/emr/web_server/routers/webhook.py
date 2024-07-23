from fastapi import APIRouter, Depends

from modules.service_layer.message_bus import MessageBus
from modules.web_server.schemas.server import ResponseSchema, StatusEnum
from services.emr.domain import command, event
from services.emr.web_server.dependencies.message_bus import get_message_bus

router = APIRouter()


@router.get(
    "/airtable_end_users/{airtable_end_user_reference}/examination_reports/updated",
    tags=["webhook"],
    response_model=ResponseSchema,
)
async def on_airtable_end_user_examination_reports_updated(
    airtable_end_user_reference: str,
    bus: MessageBus = Depends(get_message_bus),
):
    await bus.handle(
        event.AirtableExaminationReportCreated(
            airtable_end_user_reference=airtable_end_user_reference
        )
    )
    return ResponseSchema(status=StatusEnum.SUCCESS)


@router.get(
    "/airtable_care_cases/{airtable_care_case_reference}/updated",
    tags=["webhook"],
    response_model=ResponseSchema,
)
async def on_airtable_care_case_updated(
    airtable_care_case_reference: str,
    bus: MessageBus = Depends(get_message_bus),
):
    await bus.handle(
        command.PullAirtableCareCase(airtable_reference=airtable_care_case_reference)
    )
    return ResponseSchema(status=StatusEnum.SUCCESS)
