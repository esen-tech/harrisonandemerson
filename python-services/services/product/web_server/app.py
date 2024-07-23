from fastapi import FastAPI

from modules.web_server.fastapi import BaseFastAPI
from services.product.web_server.routers import cross_service, order, product, webhook


def get_app() -> FastAPI:
    app = BaseFastAPI(title="Product API")
    app.include_router(cross_service.router)
    app.include_router(order.router)
    app.include_router(product.router)
    app.include_router(webhook.router)
    return app
