from core.config import get_config as get_core_config
from core.exceptions import EsenException
from modules.web_server.config import get_config
from modules.web_server.exceptions import (
    EsenBadRequestError,
    EsenPermissionDeniedError,
    EsenUnauthorizedError,
)
from modules.web_server.routers import system
from modules.web_server.schemas.server import ResponseSchema, StatusEnum
from starlette.exceptions import HTTPException

from fastapi import FastAPI, Request, status
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


class BaseFastAPI(FastAPI):
    def __init__(self, *args, **kwargs):
        core_config = get_core_config()
        config = get_config()
        super().__init__(
            *args,
            docs_url=config.DOCS_URL,
            version=core_config.RELEASE_IMAGE_TAG,
            **kwargs,
        )
        self.include_router(system.router)
        self.add_error_handlers()

    def add_error_handlers(self):
        @self.exception_handler(RequestValidationError)
        async def request_validation_error_handler(
            request: Request, exc: RequestValidationError
        ):
            return JSONResponse(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                content=ResponseSchema(
                    status=StatusEnum.FAILED,
                    data={
                        "message": "Invalid request format",
                        "detail": jsonable_encoder(exc.errors()),
                    },
                ).dict(),
            )

        @self.exception_handler(404)
        async def not_found_error_handler(request: Request, exc: HTTPException):
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content=ResponseSchema(
                    status=StatusEnum.FAILED,
                    data={"message": f"{exc.detail}"},
                ).dict(),
            )

        @self.exception_handler(EsenBadRequestError)
        async def esen_bad_request_error_handler(
            req: Request, exc: EsenBadRequestError
        ):
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content=ResponseSchema(
                    status=StatusEnum.FAILED, data={"message": f"{exc}"}
                ).dict(),
            )

        @self.exception_handler(EsenUnauthorizedError)
        async def esen_unauthorized_error_handler(
            req: Request, exc: EsenUnauthorizedError
        ):
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content=ResponseSchema(
                    status=StatusEnum.FAILED, data={"message": f"{exc}"}
                ).dict(),
            )

        @self.exception_handler(EsenPermissionDeniedError)
        async def esen_permission_denied_error_handler(
            req: Request, exc: EsenPermissionDeniedError
        ):
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content=ResponseSchema(
                    status=StatusEnum.FAILED, data={"message": f"{exc}"}
                ).dict(),
            )

        @self.exception_handler(EsenException)
        async def esen_exception_handler(req: Request, exc: EsenException):
            print(f"{exc}", flush=True)  # log error intentionally
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content=ResponseSchema(
                    status=StatusEnum.FAILED, data={"message": f"Internal Server Error"}
                ).dict(),
            )
