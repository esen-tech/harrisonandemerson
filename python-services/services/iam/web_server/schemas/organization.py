from modules.domain.types import Date, Reference
from modules.web_server.schemas.base import (
    BaseRetrieveEntitySchema,
    BaseUpdateEntitySchema,
)
from services.iam.domain.models.organization import Organization


class RetrieveCrossServiceOrganizationSchema(BaseRetrieveEntitySchema):
    display_key: str
    branch_key: str | None


class RetrieveOrganizationSummarySchema(BaseRetrieveEntitySchema):
    display_key: str
    branch_key: str | None
    phone_number: str | None
    banner_src: str | None
    correspondence_address: str | None


class RetrieveOrganizationDetailSchema(RetrieveOrganizationSummarySchema):
    operational_state: Organization.OperationalStateEnum | None
    registered_name: str | None
    registered_address: str | None
    registered_medical_specialty: str | None
    registered_organization_code: str | None
    registered_representative_internal_user_reference: Reference | None
    registered_business_commencement_date: Date | None


class UpdateOrganizationSchema(BaseUpdateEntitySchema):
    display_key: str | None
    branch_key: str | None
    phone_number: str | None
    banner_src: str | None
    correspondence_address: str | None
    operational_state: Organization.OperationalStateEnum | None
