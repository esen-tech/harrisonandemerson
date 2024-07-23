from typing import Dict, List

from pydantic import BaseModel

from modules.domain.types import Reference


class CurrentInternalUserSchema(BaseModel):
    reference: Reference
    organization_identifier_keys_map: Dict[Reference, List[str]]


class CurrentEndUserSchema(BaseModel):
    reference: Reference

    class Config:
        orm_mode = True
