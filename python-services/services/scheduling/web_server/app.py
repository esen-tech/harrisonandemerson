from fastapi import FastAPI

from modules.web_server.fastapi import BaseFastAPI
from services.scheduling.web_server.routers import (
    appointment,
    schedule,
    time_slot_inventory,
    webhook,
)


def get_app() -> FastAPI:
    app = BaseFastAPI(title="Scheduling API")
    app.include_router(appointment.router)
    app.include_router(schedule.router)
    app.include_router(time_slot_inventory.router)
    app.include_router(webhook.router)
    return app
