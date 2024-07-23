from fastapi import FastAPI
from modules.web_server.fastapi import BaseFastAPI
from services.emr.web_server.routers import examination_report, intake_form, webhook


def get_app() -> FastAPI:
    app = BaseFastAPI(title="EMR API")
    app.include_router(examination_report.router)
    app.include_router(intake_form.router)
    app.include_router(webhook.router)
    return app
