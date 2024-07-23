from typing import Set

import httpx
from fastapi import Depends, Request, status

from modules.cross_service.cross_service_api_agent import CrossServiceAPIClient
from modules.domain.types import Reference
from modules.web_server.config import get_config as get_web_server_config
from modules.web_server.exceptions import (
    EsenPermissionDeniedError,
    EsenUnauthorizedError,
)
from modules.web_server.schemas.system import CurrentServiceSchema
from modules.web_server.schemas.user import (
    CurrentEndUserSchema,
    CurrentInternalUserSchema,
)


async def get_current_service(
    request: Request,
) -> CurrentServiceSchema | None:
    if getattr(request.state, "service", None) is not None:
        return request.state.service
    web_server_config = get_web_server_config()
    if web_server_config.SERVICE_ACCESS_TOKEN_COOKIE_KEY in request.cookies:
        cross_service_api_client = CrossServiceAPIClient(web_server_config.IAM_API_HOST)
        service_dict = await cross_service_api_client.get(
            "/services/current_from_access_token", cookies=request.cookies
        )
        service = CurrentServiceSchema(**service_dict)
        request.state.service = service
        return request.state.service


async def service_login_required(
    service: CurrentServiceSchema | None = Depends(get_current_service),
):
    if service is None:
        raise EsenUnauthorizedError("Invalid access token")


async def get_current_internal_user(
    request: Request,
) -> CurrentInternalUserSchema | None:
    if getattr(request.state, "internal_user", None) is not None:
        return request.state.internal_user
    web_server_config = get_web_server_config()
    if web_server_config.INTERNAL_USER_ACCESS_TOKEN_COOKIE_KEY in request.cookies:
        async with httpx.AsyncClient(
            base_url=web_server_config.IAM_API_HOST
        ) as iam_api_client:
            res = await iam_api_client.get(
                "/internal_users/current_from_access_token", cookies=request.cookies
            )
            if res.status_code == status.HTTP_200_OK:
                internal_user = CurrentInternalUserSchema(**res.json()["data"])
                request.state.internal_user = internal_user
                return request.state.internal_user


async def internal_user_login_required(
    internal_user: CurrentInternalUserSchema
    | None = Depends(get_current_internal_user),
):
    if internal_user is None:
        raise EsenUnauthorizedError("Invalid access token")


def internal_user_identifier_keys_required(required_identifier_key_set: Set[str]):
    async def _internal_user_identifier_keys_required(
        organization_reference: Reference | None = None,
        internal_user: CurrentInternalUserSchema
        | None = Depends(get_current_internal_user),
    ):
        if organization_reference is None:
            raise EsenPermissionDeniedError("Permission denied")
        if internal_user is None:
            raise EsenPermissionDeniedError("Permission denied")
        internal_user_identifier_key_set = set(
            internal_user.organization_identifier_keys_map[organization_reference]
        )
        if len(internal_user_identifier_key_set) == 0:
            raise EsenPermissionDeniedError("Permission denied")
        if not required_identifier_key_set <= internal_user_identifier_key_set:
            raise EsenPermissionDeniedError("Permission denied")

    return _internal_user_identifier_keys_required


async def get_current_end_user(request: Request) -> CurrentEndUserSchema | None:
    if getattr(request.state, "end_user", None) is not None:
        return request.state.end_user
    web_server_config = get_web_server_config()
    if web_server_config.END_USER_ACCESS_TOKEN_COOKIE_KEY in request.cookies:
        async with httpx.AsyncClient(
            base_url=web_server_config.IAM_API_HOST
        ) as iam_api_client:
            res = await iam_api_client.get(
                "/end_users/current_from_access_token", cookies=request.cookies
            )
            if res.status_code == status.HTTP_200_OK:
                end_user = CurrentEndUserSchema(**res.json()["data"])
                request.state.end_user = end_user
                return request.state.end_user


async def end_user_login_required(
    end_user: CurrentEndUserSchema | None = Depends(get_current_end_user),
):
    if end_user is None:
        raise EsenUnauthorizedError("Invalid access token")
