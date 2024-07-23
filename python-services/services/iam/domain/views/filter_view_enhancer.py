from enum import Enum

from sqlalchemy import and_, or_

from modules.domain.types import cast_string_to_date
from modules.domain.views.filter_view_enhancer import (
    FilterContextSchema,
    FilterViewEnhancer,
)
from modules.utils.user import split_name
from services.iam.domain.models.end_user import EndUser
from services.iam.domain.models.organization import Organization
from services.iam.domain.models.organization_internal_user import (
    OrganizationInternalUser,
)
from services.iam.domain.models.team import Team


class EndUserFilterEnum(Enum):
    NAME = "NAME"
    BIRTH_DATE = "BIRTH_DATE"
    PHONE = "PHONE"
    TW_IDENTITY_CARD = "TW_IDENTITY_CARD"


end_user_filter_view_enhancer = FilterViewEnhancer(EndUserFilterEnum)


@end_user_filter_view_enhancer.handler(EndUserFilterEnum.NAME)
def handle_name_filter(statement, filter_context: FilterContextSchema):
    first_name, last_name = split_name(filter_context.query)
    return statement.where(
        or_(
            EndUser.first_name.ilike(f"%{filter_context.query}%"),
            EndUser.last_name.ilike(f"%{filter_context.query}%"),
            and_(
                EndUser.first_name.ilike(f"%{first_name}%"),
                EndUser.last_name.ilike(f"%{last_name}%"),
            ),
        )
    )


@end_user_filter_view_enhancer.handler(EndUserFilterEnum.BIRTH_DATE)
def handle_phone_filter(statement, filter_context: FilterContextSchema):
    birth_date = cast_string_to_date(filter_context.query)
    return statement.where(EndUser.birth_date == birth_date)


@end_user_filter_view_enhancer.handler(EndUserFilterEnum.PHONE)
def handle_phone_filter(statement, filter_context: FilterContextSchema):
    return statement.where(EndUser.phone_number.like(f"%{filter_context.query}%"))


@end_user_filter_view_enhancer.handler(EndUserFilterEnum.TW_IDENTITY_CARD)
def handle_identity_card_filter(statement, filter_context: FilterContextSchema):
    return statement.where(
        EndUser.tw_identity_card_number.ilike(f"%{filter_context.query}%")
    )


class OrganizationInternalUserFilterEnum(Enum):
    EMPLOYMENT_STATE = "EMPLOYMENT_STATE"


organization_internal_user_filter_view_enhancer = FilterViewEnhancer(
    OrganizationInternalUserFilterEnum
)


@organization_internal_user_filter_view_enhancer.handler(
    OrganizationInternalUserFilterEnum.EMPLOYMENT_STATE
)
def handle_employment_state_filter(statement, filter_context: FilterContextSchema):
    return statement.where(
        OrganizationInternalUser.employment_state == filter_context.query
    )


class TeamFilterEnum(Enum):
    ORGANIZATION_REFERENCE = "ORGANIZATION_REFERENCE"


team_filter_view_enhancer = FilterViewEnhancer(TeamFilterEnum)


@team_filter_view_enhancer.handler(TeamFilterEnum.ORGANIZATION_REFERENCE)
def handle_organization_reference_filter(
    statement, filter_context: FilterContextSchema
):
    return statement.join(Team.organization).where(
        Organization.reference == filter_context.query
    )
