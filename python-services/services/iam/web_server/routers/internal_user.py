import uuid
from datetime import timedelta
from typing import List

from fastapi import APIRouter, Depends, Query, Request, Response

from modules.domain.types import Reference
from modules.service_layer.message_bus import MessageBus
from modules.web_server.config import get_config as get_web_server_config
from modules.web_server.dependencies.auth import (
    get_current_internal_user,
    internal_user_login_required,
)
from modules.web_server.exceptions import EsenUnauthorizedError
from modules.web_server.schemas.server import ResponseSchema, StatusEnum
from modules.web_server.schemas.user import CurrentInternalUserSchema
from services.iam.config import get_config
from services.iam.domain import command
from services.iam.domain.views import internal_user as internal_user_views
from services.iam.service_layer.handlers import InvalidCredential
from services.iam.web_server.dependencies.message_bus import get_message_bus
from services.iam.web_server.schemas.internal_user import (
    LoginInternalUserSchema,
    RetrieveInternalUserDetailSchema,
    RetrieveInternalUserSummarySchema,
)

router = APIRouter()


@router.post(
    "/internal_users/login",
    tags=["internal_user"],
    response_model=ResponseSchema,
)
async def login_internal_user(
    payload: LoginInternalUserSchema,
    request: Request,
    response: Response,
    bus: MessageBus = Depends(get_message_bus),
):
    config = get_config()
    request_access_token_value = uuid.uuid4().hex
    request_access_token_token_age = timedelta(days=10)
    try:
        cmd = command.LoginInternalUser(
            request_access_token_value=request_access_token_value,
            request_access_token_token_age=request_access_token_token_age,
            payload=payload,
        )
        await bus.handle(cmd)
    except InvalidCredential as e:
        raise EsenUnauthorizedError(e)

    web_server_config = get_web_server_config()
    response.set_cookie(
        key=web_server_config.INTERNAL_USER_ACCESS_TOKEN_COOKIE_KEY,
        value=request_access_token_value,
        max_age=request_access_token_token_age.total_seconds(),
        secure=True,
        httponly=True,
        domain=config.INTERNAL_USER_ACCESS_TOKEN_COOKIE_DOMAIN,
    )
    return ResponseSchema(status=StatusEnum.SUCCESS)


@router.post(
    "/internal_users/logout",
    tags=["internal_user"],
    response_model=ResponseSchema,
)
async def logout_internal_user(
    request: Request,
    response: Response,
    bus: MessageBus = Depends(get_message_bus),
):
    web_server_config = get_web_server_config()
    access_token_value = request.cookies.get(
        web_server_config.INTERNAL_USER_ACCESS_TOKEN_COOKIE_KEY
    )
    cmd = command.LogoutInternalUser(access_token_value=access_token_value)
    await bus.handle(cmd)
    response.set_cookie(
        key=web_server_config.INTERNAL_USER_ACCESS_TOKEN_COOKIE_KEY,
        value="",
        max_age=0,
    )
    return ResponseSchema(status=StatusEnum.SUCCESS)


@router.get(
    "/internal_users/current_from_access_token",
    tags=["internal_user"],
    response_model=ResponseSchema[CurrentInternalUserSchema],
)
async def get_current_internal_user_from_access_token(
    request: Request, bus: MessageBus = Depends(get_message_bus)
):
    web_server_config = get_web_server_config()
    data = await internal_user_views.get_internal_user_by_access_token_value(
        bus.uow,
        request.cookies.get(web_server_config.INTERNAL_USER_ACCESS_TOKEN_COOKIE_KEY),
    )
    if data is None:
        raise EsenUnauthorizedError()
    return ResponseSchema[CurrentInternalUserSchema](
        status=StatusEnum.SUCCESS, data=data
    )


@router.get(
    "/internal_users/me",
    tags=["internal_user"],
    dependencies=[Depends(internal_user_login_required)],
    response_model=ResponseSchema[RetrieveInternalUserDetailSchema],
)
async def get_current_internal_user_detail(
    internal_user: CurrentInternalUserSchema = Depends(get_current_internal_user),
    bus: MessageBus = Depends(get_message_bus),
):
    data = await internal_user_views.get_internal_user_by_reference(
        bus.uow, internal_user.reference
    )
    return ResponseSchema[RetrieveInternalUserDetailSchema](
        status=StatusEnum.SUCCESS, data=data
    )


@router.get(
    "/internal_users",
    tags=["internal_user"],
    response_model=ResponseSchema[List[RetrieveInternalUserSummarySchema]],
)
async def get_internal_users(
    references: List[Reference] = Query(default=None),
    bus: MessageBus = Depends(get_message_bus),
):
    data = await internal_user_views.get_internal_users_by_references(
        bus.uow, references
    )
    return ResponseSchema[List[RetrieveInternalUserSummarySchema]](
        status=StatusEnum.SUCCESS, data=data
    )
