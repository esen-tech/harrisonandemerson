from typing import Dict

from pydantic import BaseModel

from modules.domain.types import Reference


class ConfigSchema(BaseModel):
    AIRTABLE_API_KEY: str
    AIRTABLE_API_KEY_EDITOR: str | None
    ESEN_CLINIC_ORGANIZATION_REFERENCE: Reference
    AIRTABLE_STAFF_RECORD_ID_TO_INTERNAL_USER_REFERENCE_MAP: Dict[str, Reference]
    # SERVICE_PRODUCT_REFERENCE_TO_AIRTABLE_VISIT_門診類別_MAP: Dict[Reference, str]
    AIRTABLE_VISIT_門診類別_TO_SERVICE_PRODUCT_REFERENCE_MAP: Dict[str, Reference]
    AIRTABLE_健管師_RECORD_ID_TO_INTERNAL_USER_REFERENCE_MAP: Dict[str, Reference]
    EXAMINATION_REPORT_FILE_GROUP_NAME: str
