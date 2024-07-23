from pydantic import BaseModel


class ConfigSchema(BaseModel):
    DATABASE_URL: str
    SCHEMA_NAME: str
    IGNORE_BASE_SCHEMA_NAME: bool
