from fastapi import APIRouter, Depends
from modules.service_layer.message_bus import MessageBus
from modules.web_server.schemas.server import ResponseSchema, StatusEnum
from services.scheduling.domain import event
from services.scheduling.web_server.dependencies.message_bus import get_message_bus

router = APIRouter()


@router.get(
    "/airtable_schedules/updated",
    tags=["webhook"],
    response_model=ResponseSchema,
)
async def on_airtable_schedules_updated(
    bus: MessageBus = Depends(get_message_bus),
):
    await bus.handle(event.AirtableSchedulesUpdated())
    return ResponseSchema(status=StatusEnum.SUCCESS)


@router.get(
    "/airtable_visits/{airtable_visit_reference}/updated",
    tags=["webhook"],
    response_model=ResponseSchema,
)
async def on_airtable_visit_updated(
    airtable_visit_reference: str,
    bus: MessageBus = Depends(get_message_bus),
):
    await bus.handle(
        event.AirtableVisitUpserted(airtable_reference=airtable_visit_reference)
    )
    return ResponseSchema(status=StatusEnum.SUCCESS)
