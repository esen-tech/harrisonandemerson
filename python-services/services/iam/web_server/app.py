from fastapi import FastAPI

from modules.web_server.fastapi import BaseFastAPI
from services.iam.web_server.routers import (
    benefit,
    cross_service,
    end_user,
    internal_user,
    organization,
    organization_internal_user,
    permission,
    service,
    team,
    team_internal_user,
    team_permission,
    webhook,
)


def get_app() -> FastAPI:
    app = BaseFastAPI(title="IAM API")
    app.include_router(benefit.router)
    app.include_router(cross_service.router)
    app.include_router(end_user.router)
    app.include_router(internal_user.router)
    app.include_router(organization.router)
    app.include_router(organization_internal_user.router)
    app.include_router(permission.router)
    app.include_router(service.router)
    app.include_router(team.router)
    app.include_router(team_internal_user.router)
    app.include_router(team_permission.router)
    app.include_router(webhook.router)
    return app
