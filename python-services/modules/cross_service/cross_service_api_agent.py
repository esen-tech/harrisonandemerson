import httpx
from fastapi import status

from core.exceptions import EsenException
from modules.cross_service.config import get_config as get_cross_service_config
from modules.web_server.config import get_config as get_web_server_config


class CrossServiceAPIClient:
    def __init__(self, host: str, service_access_token: str | None = None):
        self._host = host
        if service_access_token is None:
            cross_service_config = get_cross_service_config()
            self._service_access_token = cross_service_config.SERVICE_ACCESS_TOKEN
        else:
            self._service_access_token = service_access_token

    async def get(self, path: str, cookies: dict = None, **kwargs) -> dict:
        web_server_config = get_web_server_config()
        if cookies is None:
            cookies = {}
        async with httpx.AsyncClient(verify=False) as client:
            response = await client.get(
                f"{self._host}{path}",
                cookies={
                    **cookies,
                    web_server_config.SERVICE_ACCESS_TOKEN_COOKIE_KEY: self._service_access_token,
                },
                **kwargs,
            )
            if response.status_code != status.HTTP_200_OK:
                raise EsenException("Failed to cross service get resource.")
            res_json = response.json()
            res_dict = res_json["data"]
        return res_dict

    async def post(self, path: str, json: dict, cookies: dict = None, **kwargs) -> dict:
        web_server_config = get_web_server_config()
        if cookies is None:
            cookies = {}
        async with httpx.AsyncClient(verify=False) as client:
            response = await client.post(
                f"{self._host}{path}",
                cookies={
                    **cookies,
                    web_server_config.SERVICE_ACCESS_TOKEN_COOKIE_KEY: self._service_access_token,
                },
                json=json,
                **kwargs,
            )
            if response.status_code != status.HTTP_200_OK:
                raise EsenException("Failed to cross service post resource.")
            res_json = response.json()
            res_dict = res_json["data"]
        return res_dict
