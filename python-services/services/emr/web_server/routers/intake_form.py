from fastapi import APIRouter, Depends
from modules.service_layer.message_bus import MessageBus
from modules.web_server.dependencies.auth import (
    end_user_login_required,
    get_current_end_user,
)
from modules.web_server.schemas.server import ResponseSchema, StatusEnum
from modules.web_server.schemas.user import CurrentEndUserSchema
from services.emr.domain.views import intake_form as intake_form_views
from services.emr.web_server.dependencies.message_bus import get_message_bus
from services.emr.web_server.schemas.intake_form import RetrieveEndUserIntakeFormSchema

router = APIRouter()


@router.get(
    "/end_users/me/intake_form",
    tags=["end_user"],
    dependencies=[Depends(end_user_login_required)],
    response_model=ResponseSchema,
)
async def get_current_end_user_intake_form(
    end_user: CurrentEndUserSchema = Depends(get_current_end_user),
    bus: MessageBus = Depends(get_message_bus),
):
    data = await intake_form_views.get_end_user_intake_form_by_end_user_reference(
        bus.uow, end_user.reference
    )
    return ResponseSchema[RetrieveEndUserIntakeFormSchema](
        status=StatusEnum.SUCCESS, data=data
    )
