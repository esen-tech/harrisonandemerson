from pydantic import BaseModel


class ConfigSchema(BaseModel):
    ECPAY_HOST: str
    ECPAY_MERCHANT_ID: str
    ECPAY_HASH_KEY: str
    ECPAY_HASH_IV: str
