from sqlalchemy.orm import backref, configure_mappers, relationship

from modules.database.sa.registry import mapper_registry
from services.iam.database.tables.end_user import end_user_table
from services.iam.database.tables.end_user_access_token import (
    end_user_access_token_table,
)
from services.iam.database.tables.insurer import insurer_table
from services.iam.database.tables.internal_user import internal_user_table
from services.iam.database.tables.internal_user_access_token import (
    internal_user_access_token_table,
)
from services.iam.database.tables.organization import organization_table
from services.iam.database.tables.organization_internal_user import (
    organization_internal_user_table,
)
from services.iam.database.tables.organization_organization import (
    organization_organization_table,
)
from services.iam.database.tables.otp_token import otp_token_table
from services.iam.database.tables.permission import permission_table
from services.iam.database.tables.service import service_table
from services.iam.database.tables.service_access_token import service_access_token_table
from services.iam.database.tables.team import team_table
from services.iam.database.tables.team_internal_user import team_internal_user_table
from services.iam.database.tables.team_permission import team_permission_table
from services.iam.domain.models.end_user import EndUser
from services.iam.domain.models.end_user_access_token import EndUserAccessToken
from services.iam.domain.models.insurer import Insurer
from services.iam.domain.models.internal_user import InternalUser
from services.iam.domain.models.internal_user_access_token import (
    InternalUserAccessToken,
)
from services.iam.domain.models.organization import Organization
from services.iam.domain.models.organization_internal_user import (
    OrganizationInternalUser,
)
from services.iam.domain.models.organization_organization import (
    OrganizationOrganization,
)
from services.iam.domain.models.otp_token import OTPToken
from services.iam.domain.models.permission import Permission
from services.iam.domain.models.service import Service
from services.iam.domain.models.service_access_token import ServiceAccessToken
from services.iam.domain.models.team import Team
from services.iam.domain.models.team_internal_user import TeamInternalUser
from services.iam.domain.models.team_permission import TeamPermission


def start_mappers():
    mapper_registry.map_imperatively(Permission, permission_table)
    mapper_registry.map_imperatively(
        Organization,
        organization_table,
        properties={
            "parent_organization": relationship(
                "Organization",
                backref=backref(
                    "children_organizations",
                    cascade="all, delete-orphan",
                ),
                remote_side=organization_table.columns.reference,
            )
        },
    )
    mapper_registry.map_imperatively(
        OrganizationOrganization,
        organization_organization_table,
        properties={
            "upstream_organization": relationship(
                "Organization",
                foreign_keys=[
                    organization_organization_table.columns.upstream_organization_reference
                ],
                backref=backref("downstream_organization_organizations"),
            ),
            "downstream_organization": relationship(
                "Organization",
                foreign_keys=[
                    organization_organization_table.columns.downstream_organization_reference
                ],
                backref=backref("upstream_organization_organizations"),
            ),
        },
    )
    mapper_registry.map_imperatively(
        OrganizationInternalUser,
        organization_internal_user_table,
        properties={
            "internal_user": relationship("InternalUser"),
        },
    )
    mapper_registry.map_imperatively(
        Team,
        team_table,
        properties={"organization": relationship("Organization", backref="teams")},
    )
    mapper_registry.map_imperatively(
        TeamPermission,
        team_permission_table,
        properties={
            "team": relationship(
                "Team",
                backref=backref("team_permissions", cascade="all, delete-orphan"),
            ),
            "permission": relationship("Permission", backref="team_permissions"),
        },
    )
    mapper_registry.map_imperatively(
        TeamInternalUser,
        team_internal_user_table,
        properties={
            "team": relationship("Team", backref="team_internal_users"),
            "internal_user": relationship(
                "InternalUser", backref="team_internal_users"
            ),
        },
    )
    mapper_registry.map_imperatively(InternalUser, internal_user_table)
    mapper_registry.map_imperatively(EndUser, end_user_table)
    mapper_registry.map_imperatively(Service, service_table)

    mapper_registry.map_imperatively(OTPToken, otp_token_table)
    mapper_registry.map_imperatively(
        EndUserAccessToken,
        end_user_access_token_table,
        properties={
            "end_user": relationship("EndUser", backref="end_user_access_tokens")
        },
    )
    mapper_registry.map_imperatively(
        InternalUserAccessToken,
        internal_user_access_token_table,
        properties={
            "internal_user": relationship(
                "InternalUser", backref="internal_user_access_tokens"
            )
        },
    )
    mapper_registry.map_imperatively(
        ServiceAccessToken,
        service_access_token_table,
        properties={
            "service": relationship("Service", backref="service_access_tokens")
        },
    )

    mapper_registry.map_imperatively(Insurer, insurer_table)

    # Read more on the issue [Backref relationships don't populate in the class until instance is created](https://github.com/sqlalchemy/sqlalchemy/issues/7312)
    configure_mappers()
