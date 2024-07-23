import httpx
from fastapi import FastAPI, Request
from starlette.background import BackgroundTask
from starlette.responses import StreamingResponse


class ReverseProxy:
    def __init__(self, path_prefix: str, host: str):
        self._path_prefix = path_prefix
        self._host = host
        self._client = httpx.AsyncClient(base_url=self._host)

    async def _basic_handler(self, request: Request):
        pass
        # async with httpx.AsyncClient() as client:
        #     proxy = await self._client.get(f“http://containername:7800/{path}”)
        # response.body = proxy.content
        # response.status_code = proxy.status_code

    async def _streaming_handler(self, request: Request):
        target_path = request.url.path[len(self._path_prefix) :]
        url = httpx.URL(path=target_path, query=request.url.query.encode("utf-8"))
        rp_req = self._client.build_request(
            request.method,
            url,
            headers=request.headers.raw,
            timeout=15.0,
            content=await request.body(),
        )
        rp_resp = await self._client.send(rp_req, stream=True)
        return StreamingResponse(
            rp_resp.aiter_raw(),
            status_code=rp_resp.status_code,
            headers=rp_resp.headers,
            background=BackgroundTask(rp_resp.aclose),
        )

    def config_app(self, app: FastAPI):
        app.add_route(
            f"{self._path_prefix}/{{path:path}}",
            self._streaming_handler,
            ["GET", "POST", "PUT", "PATCH", "DELETE"],
        )
