from modules.domain.types import Reference
from pydantic import BaseModel


class BaseCreateEntitySchema(BaseModel):
    class Config:
        use_enum_values = True


class BaseRetrieveEntitySchema(BaseModel):
    reference: Reference

    class Config:
        orm_mode = True
        use_enum_values = True


class BaseUpdateEntitySchema(BaseModel):
    class Config:
        use_enum_values = True
