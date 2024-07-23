from core.schemas.system import ConfigSchema
from modules.domain.types import Reference
from pydantic import BaseModel


class LivenessSchema(BaseModel):
    pass


class InspectSchema(BaseModel):
    config: ConfigSchema


class CurrentServiceSchema(BaseModel):
    reference: Reference
