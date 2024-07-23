from fastapi import FastAPI

from modules.web_server.fastapi import BaseFastAPI
from services.marketing.web_server.routers import (
    cooperation_code,
    cross_service,
    promo_code,
)


def get_app() -> FastAPI:
    app = BaseFastAPI(title="Marketing API")
    app.include_router(cooperation_code.router)
    app.include_router(cross_service.router)
    app.include_router(promo_code.router)
    return app
