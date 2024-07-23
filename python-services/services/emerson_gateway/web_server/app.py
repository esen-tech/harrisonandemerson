from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from modules.web_server.config import get_config as get_web_server_config
from modules.web_server.fastapi import BaseFastAPI
from modules.web_server.proxy import ReverseProxy
from services.emerson_gateway.config import get_config


def get_app() -> FastAPI:
    web_server_config = get_web_server_config()
    config = get_config()

    app = BaseFastAPI(title="Emerson API Gateway")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=config.ALLOW_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    ReverseProxy("/iam", web_server_config.IAM_API_HOST).config_app(app)
    ReverseProxy("/scheduling", web_server_config.SCHEDULING_API_HOST).config_app(app)
    ReverseProxy("/emr", web_server_config.EMR_API_HOST).config_app(app)
    ReverseProxy("/product", web_server_config.PRODUCT_API_HOST).config_app(app)
    ReverseProxy(
        "/airtable_integration", web_server_config.AIRTABLE_INTEGRATION_API_HOST
    ).config_app(app)
    return app
