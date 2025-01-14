from core.config import get_config as get_core_config
from core.enum import EnvEnum
from services.iam.schemas.config import ConfigSchema


def get_config() -> ConfigSchema:
    config = get_core_config()

    INTERNAL_USER_ACCESS_TOKEN_COOKIE_DOMAIN = None
    END_USER_ACCESS_TOKEN_COOKIE_DOMAIN = None
    OTP_TOKEN_COOKIE_DOMAIN = None

    if config.ENV == EnvEnum.STAGING:
        OTP_TOKEN_COOKIE_DOMAIN = ".stg-cloud.esenmedical.com"
        INTERNAL_USER_ACCESS_TOKEN_COOKIE_DOMAIN = ".stg-cloud.esenmedical.com"
        END_USER_ACCESS_TOKEN_COOKIE_DOMAIN = ".stg-cloud.esenmedical.com"
    elif config.ENV == EnvEnum.PRODUCTION:
        OTP_TOKEN_COOKIE_DOMAIN = ".cloud.esenmedical.com"
        INTERNAL_USER_ACCESS_TOKEN_COOKIE_DOMAIN = ".cloud.esenmedical.com"
        END_USER_ACCESS_TOKEN_COOKIE_DOMAIN = ".cloud.esenmedical.com"

    return ConfigSchema(
        INTERNAL_USER_ACCESS_TOKEN_COOKIE_DOMAIN=INTERNAL_USER_ACCESS_TOKEN_COOKIE_DOMAIN,
        INTERNAL_USER_ACCESS_TOKEN_HEADER_KEY="X-I-ACCESS-TOKEN",
        END_USER_ACCESS_TOKEN_COOKIE_DOMAIN=END_USER_ACCESS_TOKEN_COOKIE_DOMAIN,
        END_USER_ACCESS_TOKEN_HEADER_KEY="X-E-ACCESS-TOKEN",
        OTP_TOKEN_SERIAL_NUMBER_SIGNUP_INTENT_COOKIE_KEY="OTP-TOKEN-SERIAL-NUMBER-SIGNUP-INTENT",
        OTP_TOKEN_SERIAL_NUMBER_VERIFY_SIGNUP_INTENT_COOKIE_KEY="OTP-TOKEN-SERIAL-NUMBER-VERIFY-SIGNUP-INTENT",
        OTP_TOKEN_SERIAL_NUMBER_LOGIN_INTENT_COOKIE_KEY="OTP-TOKEN-SERIAL-NUMBER-LOGIN-INTENT",
        OTP_TOKEN_COOKIE_DOMAIN=OTP_TOKEN_COOKIE_DOMAIN,
    )
