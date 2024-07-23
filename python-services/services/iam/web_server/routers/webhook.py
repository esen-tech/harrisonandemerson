from fastapi import APIRouter, Depends
from modules.service_layer.message_bus import MessageBus
from modules.web_server.schemas.server import ResponseSchema, StatusEnum
from services.iam.domain import event
from services.iam.web_server.dependencies.message_bus import get_message_bus

router = APIRouter()


@router.get(
    "/airtable_end_users/{airtable_end_user_reference}/updated",
    tags=["webhook"],
    response_model=ResponseSchema,
)
async def on_airtable_end_user_updated(
    airtable_end_user_reference: str,
    bus: MessageBus = Depends(get_message_bus),
):
    await bus.handle(
        event.AirtableEndUserUpserted(airtable_reference=airtable_end_user_reference)
    )
    return ResponseSchema(status=StatusEnum.SUCCESS)
