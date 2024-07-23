from dataclasses import dataclass
from datetime import timedelta

from modules.domain.command import Command
from modules.domain.types import Reference
from services.iam.web_server.schemas.end_user import (  # CreateEndUserByServiceSchema,; UpdateEndUserByServiceSchema,
    CreateEndUserByInternalUserSchema,
    CreateEndUserLoginIntentSchema,
    CreateEndUserSignupIntentSchema,
    LoginEndUserSchema,
    SignupEndUserSchema,
    UpdateEndUserSchema,
    VerifyEndUserSignupIntentSchema,
)
from services.iam.web_server.schemas.internal_user import LoginInternalUserSchema
from services.iam.web_server.schemas.organization import UpdateOrganizationSchema
from services.iam.web_server.schemas.team import (
    CreateTeamByInternalUserSchema,
    UpdateTeamByInternalUserSchema,
)
from services.iam.web_server.schemas.team_internal_user import (
    CreateTeamInternalUserSchema,
)
from services.iam.web_server.schemas.team_permission import (
    UpdateTeamTeamPermissionsSchema,
)


@dataclass
class UpdateOrganizationByOwner(Command):
    internal_user_reference: Reference
    organization_reference: Reference
    payload: UpdateOrganizationSchema


@dataclass
class CreateEndUserSignupIntent(Command):
    request_token_serial_number: str
    request_token_otp_value: str
    request_token_token_age: timedelta
    payload: CreateEndUserSignupIntentSchema


@dataclass
class VerifyEndUserSignupIntent(Command):
    resolve_token_serial_number: str
    request_token_serial_number: str
    request_token_otp_value: str
    request_token_token_age: timedelta
    payload: VerifyEndUserSignupIntentSchema


@dataclass
class SignupEndUser(Command):
    resolve_token_serial_number: str
    resolve_token_otp_value: str
    request_access_token_value: str
    request_access_token_token_age: timedelta
    reference: Reference
    airtable_reference: str
    payload: SignupEndUserSchema


@dataclass
class CreateEndUserFromAirtableEndUser(Command):
    phone_number: str
    airtable_end_user: dict


@dataclass
class CreateEndUserLoginIntent(Command):
    request_token_serial_number: str
    request_token_otp_value: str
    request_token_token_age: timedelta
    payload: CreateEndUserLoginIntentSchema


@dataclass
class LoginEndUser(Command):
    resolve_token_serial_number: str
    resolve_token_otp_value: str
    request_access_token_value: str
    request_access_token_token_age: timedelta
    payload: LoginEndUserSchema


@dataclass
class LogoutEndUser(Command):
    access_token_value: str


@dataclass
class UpdateEndUser(Command):
    end_user_reference: Reference
    payload: UpdateEndUserSchema


# @dataclass
# class UpdateEndUserByService(Command):
#     end_user_reference: Reference
#     payload: UpdateEndUserByServiceSchema


@dataclass
class LoginInternalUser(Command):
    request_access_token_value: str
    request_access_token_token_age: timedelta
    payload: LoginInternalUserSchema


@dataclass
class LogoutInternalUser(Command):
    access_token_value: str


@dataclass
class CreateEndUserByInternalUser(Command):
    reference: Reference
    # care_airtable_reference: str
    payload: CreateEndUserByInternalUserSchema


# @dataclass
# class CreateEndUserByService(Command):
#     care_airtable_reference: str
#     payload: CreateEndUserByServiceSchema


@dataclass
class CreateTeamInternalUser(Command):
    team_reference: Reference
    payload: CreateTeamInternalUserSchema


@dataclass
class DeleteTeamInternalUser(Command):
    team_internal_user_reference: Reference


@dataclass
class UpdateTeamTeamPermissions(Command):
    team_reference: Reference
    payload: UpdateTeamTeamPermissionsSchema


@dataclass
class CreateTeamByInternalUser(Command):
    reference: Reference
    organization_reference: Reference
    payload: CreateTeamByInternalUserSchema


@dataclass
class UpdateTeamByInternalUser(Command):
    team_reference: Reference
    payload: UpdateTeamByInternalUserSchema


@dataclass
class DeleteTeamByInternalUser(Command):
    team_reference: Reference
