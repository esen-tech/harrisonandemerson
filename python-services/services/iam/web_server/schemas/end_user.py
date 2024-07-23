from modules.domain.types import Date
from modules.web_server.schemas.base import (
    BaseCreateEntitySchema,
    BaseRetrieveEntitySchema,
    BaseUpdateEntitySchema,
)
from services.iam.domain.models.end_user import EndUser


class CreateEndUserByInternalUserSchema(BaseCreateEntitySchema):
    first_name: str | None
    last_name: str | None
    phone_number: str | None
    email_address: str | None


# class CreateEndUserByServiceSchema(BaseCreateEntitySchema):
#     reference: Reference
#     first_name: str | None
#     last_name: str | None
#     phone_number: str


# class CreateEndUserCareAirtableEndUserByServiceSchema(BaseCreateEntitySchema):
#     first_name: str | None
#     last_name: str | None
#     phone_number: str


class CreateEndUserSignupIntentSchema(BaseCreateEntitySchema):
    phone_number: str | None
    email_address: str | None


class VerifyEndUserSignupIntentSchema(BaseCreateEntitySchema):
    phone_number: str | None
    email_address: str | None
    one_time_password: str


class SignupEndUserSchema(BaseCreateEntitySchema):
    first_name: str | None
    last_name: str | None
    phone_number: str | None
    email_address: str | None
    birth_date: Date | None
    gender: EndUser.GenderEnum | None
    tw_identity_card_number: str | None
    token: str


class CreateEndUserLoginIntentSchema(BaseCreateEntitySchema):
    phone_number: str | None
    email_address: str | None


class LoginEndUserSchema(BaseCreateEntitySchema):
    phone_number: str | None
    email_address: str | None
    one_time_password: str


class RetrieveEndUserSummarySchema(BaseRetrieveEntitySchema):
    first_name: str | None
    last_name: str | None
    birth_date: Date | None
    tw_identity_card_number: str | None
    phone_number: str | None


class RetrieveEndUserDetailSchema(RetrieveEndUserSummarySchema):
    gender: EndUser.GenderEnum | None
    passport_number: str | None
    correspondence_address: str | None
    email_address: str | None
    emergency_contact_first_name: str | None
    emergency_contact_last_name: str | None
    emergency_contact_relationship_type: str | None
    emergency_contact_phone_number: str | None
    airtable_reference: str | None
    care_airtable_reference: str | None


class RetrieveCrossServiceEndUserSchema(BaseRetrieveEntitySchema):
    first_name: str | None
    last_name: str | None
    full_person_name: str | None
    birth_date: Date | None
    tw_identity_card_number: str | None
    gender: EndUser.GenderEnum | None
    airtable_reference: str | None
    care_airtable_reference: str | None


class UpdateEndUserSchema(BaseUpdateEntitySchema):
    first_name: str | None
    last_name: str | None
    birth_date: Date | None
    gender: EndUser.GenderEnum | None
    tw_identity_card_number: str | None
    passport_number: str | None
    correspondence_address: str | None
    email_address: str | None
    emergency_contact_first_name: str | None
    emergency_contact_last_name: str | None
    emergency_contact_relationship_type: str | None
    emergency_contact_phone_number: str | None


# class UpdateEndUserByServiceSchema(BaseUpdateEntitySchema):
#     care_airtable_reference: str | None
