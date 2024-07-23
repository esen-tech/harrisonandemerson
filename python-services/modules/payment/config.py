from core.config import get_config as get_core_config
from core.enum import EnvEnum
from core.env import get_env
from modules.payment.schemas.config import ConfigSchema


def get_config() -> ConfigSchema:
    core_config = get_core_config()

    ECPAY_HOST = None
    ECPAY_MERCHANT_ID = None
    ECPAY_HASH_KEY = None
    ECPAY_HASH_IV = None

    if core_config.ENV == EnvEnum.DEVELOPING:
        ECPAY_HOST = "https://payment-stage.ecpay.com.tw"
        ECPAY_MERCHANT_ID = "2000132"
        ECPAY_HASH_KEY = "5294y06JbISpM5x9"
        ECPAY_HASH_IV = "v77hoKGq4kWxNNIS"
    elif core_config.ENV == EnvEnum.STAGING:
        ECPAY_HOST = "https://payment-stage.ecpay.com.tw"
        ECPAY_MERCHANT_ID = "2000132"
        ECPAY_HASH_KEY = "5294y06JbISpM5x9"
        ECPAY_HASH_IV = "v77hoKGq4kWxNNIS"
    elif core_config.ENV == EnvEnum.PRODUCTION:
        ECPAY_HOST = "https://payment.ecpay.com.tw"
        ECPAY_MERCHANT_ID = get_env("ECPAY_MERCHANT_ID")
        ECPAY_HASH_KEY = get_env("ECPAY_HASH_KEY")
        ECPAY_HASH_IV = get_env("ECPAY_HASH_IV")

    return ConfigSchema(
        ECPAY_HOST=ECPAY_HOST,
        ECPAY_MERCHANT_ID=ECPAY_MERCHANT_ID,
        ECPAY_HASH_KEY=ECPAY_HASH_KEY,
        ECPAY_HASH_IV=ECPAY_HASH_IV,
    )
