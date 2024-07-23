from pydantic import BaseModel


class ConfigSchema(BaseModel):
    STORAGE_ENGINE_CREDENTIALS: str
    STORAGE_BUCKET_NAME: str
