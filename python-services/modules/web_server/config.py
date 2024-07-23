from core.config import get_config as get_core_config
from core.enum import EnvEnum
from core.env import get_env
from modules.web_server.schemas.config import ConfigSchema


def get_config() -> ConfigSchema:
    config = get_core_config()

    DOCS_URL = "/docs"
    HARRISON_GATEWAY_HOST = "http://localhost:8000"
    # HARRISON_GATEWAY_HOST = (
    #     "https://967c-2001-b011-400a-1d2f-c587-8bb7-f4e-5bd8.ngrok.io"
    # )
    EMERSON_GATEWAY_HOST = "http://localhost:8001"
    IAM_API_HOST = "http://localhost:9001"
    SCHEDULING_API_HOST = "http://localhost:9004"
    EMR_API_HOST = "http://localhost:9005"
    MARKETING_API_HOST = "http://localhost:9006"
    PRODUCT_API_HOST = "http://localhost:9007"
    AIRTABLE_INTEGRATION_API_HOST = "http://localhost:9999"

    if config.ENV == EnvEnum.STAGING:
        # <service-name>.<namespace>.svc.cluster.local:<service-port>
        # http://helloworldsvc
        # http://helloworldsvc.default
        # http://helloworldsvc.default.svc
        # http://helloworldsvc.default.svc.cluster.local
        # http://helloworldsvc.default.svc.cluster.local:80
        HARRISON_GATEWAY_HOST = "https://harrison-gateway.stg-cloud.esenmedical.com"
        EMERSON_GATEWAY_HOST = "https://emerson-gateway.stg-cloud.esenmedical.com"
        IAM_API_HOST = "http://iam-web-server.default.svc.cluster.local:8000"
        SCHEDULING_API_HOST = (
            "http://scheduling-web-server.default.svc.cluster.local:8000"
        )
        EMR_API_HOST = "http://emr-web-server.default.svc.cluster.local:8000"
        MARKETING_API_HOST = (
            "http://marketing-web-server.default.svc.cluster.local:8000"
        )
        PRODUCT_API_HOST = "http://product-web-server.default.svc.cluster.local:8000"
        AIRTABLE_INTEGRATION_API_HOST = (
            "http://airtable-integration-web-server.default.svc.cluster.local:8000"
        )
    elif config.ENV == EnvEnum.PRODUCTION:
        DOCS_URL = None
        HARRISON_GATEWAY_HOST = "https://harrison-gateway.cloud.esenmedical.com"
        EMERSON_GATEWAY_HOST = "https://emerson-gateway.cloud.esenmedical.com"
        IAM_API_HOST = "http://iam-web-server.default.svc.cluster.local:8000"
        SCHEDULING_API_HOST = (
            "http://scheduling-web-server.default.svc.cluster.local:8000"
        )
        EMR_API_HOST = "http://emr-web-server.default.svc.cluster.local:8000"
        MARKETING_API_HOST = (
            "http://marketing-web-server.default.svc.cluster.local:8000"
        )
        PRODUCT_API_HOST = "http://product-web-server.default.svc.cluster.local:8000"
        AIRTABLE_INTEGRATION_API_HOST = (
            "http://airtable-integration-web-server.default.svc.cluster.local:8000"
        )

    return ConfigSchema(
        DOCS_URL=DOCS_URL,
        HARRISON_GATEWAY_HOST=HARRISON_GATEWAY_HOST,
        EMERSON_GATEWAY_HOST=EMERSON_GATEWAY_HOST,
        IAM_API_HOST=get_env("IAM_API_HOST", default=IAM_API_HOST),
        SCHEDULING_API_HOST=get_env("SCHEDULING_API_HOST", default=SCHEDULING_API_HOST),
        EMR_API_HOST=get_env("EMR_API_HOST", default=EMR_API_HOST),
        MARKETING_API_HOST=get_env("MARKETING_API_HOST", default=MARKETING_API_HOST),
        PRODUCT_API_HOST=get_env("PRODUCT_API_HOST", default=PRODUCT_API_HOST),
        AIRTABLE_INTEGRATION_API_HOST=get_env(
            "AIRTABLE_INTEGRATION_API_HOST", default=AIRTABLE_INTEGRATION_API_HOST
        ),
        SERVICE_ACCESS_TOKEN_COOKIE_KEY="S-ACCESS-TOKEN",
        INTERNAL_USER_ACCESS_TOKEN_COOKIE_KEY="I-ACCESS-TOKEN",
        END_USER_ACCESS_TOKEN_COOKIE_KEY="E-ACCESS-TOKEN",
    )
