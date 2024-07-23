from fastapi import APIRouter, Depends, Request
from modules.service_layer.message_bus import MessageBus
from modules.web_server.config import get_config as get_web_server_config
from modules.web_server.schemas.server import ResponseSchema, StatusEnum
from modules.web_server.schemas.system import CurrentServiceSchema
from services.iam.domain.views import service as service_views
from services.iam.web_server.dependencies.message_bus import get_message_bus

router = APIRouter()


@router.get(
    "/services/current_from_access_token",
    tags=["service"],
    response_model=ResponseSchema[CurrentServiceSchema],
)
async def get_current_service_from_access_token(
    request: Request, bus: MessageBus = Depends(get_message_bus)
):
    web_server_config = get_web_server_config()
    data = await service_views.get_service_by_access_token_value(
        bus.uow,
        request.cookies.get(web_server_config.SERVICE_ACCESS_TOKEN_COOKIE_KEY),
    )
    return ResponseSchema[CurrentServiceSchema](status=StatusEnum.SUCCESS, data=data)
