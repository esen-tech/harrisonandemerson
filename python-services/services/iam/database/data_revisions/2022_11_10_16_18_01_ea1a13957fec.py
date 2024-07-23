from modules.database.migration import DataMigration
from services.iam.domain.models.organization import Organization
from sqlalchemy.future import select

revision = "ea1a13957fec"
down_revision = "e58681d47ddb"


async def upgrade(op: DataMigration.Operation):
    from services.iam.domain.models.internal_user import InternalUser
    from services.iam.domain.models.organization_internal_user import (
        OrganizationInternalUser,
    )
    from services.iam.domain.models.permission import Permission
    from services.iam.domain.models.team import Team
    from services.iam.domain.models.team_internal_user import TeamInternalUser
    from services.iam.domain.models.team_permission import TeamPermission

    async with op.acquire_db_session() as session:
        statement = select(Organization).where(
            Organization.data_alias == "organization_伊生股份有限公司"
        )
        result = await session.execute(statement)
        organization_esen_company: Organization = result.scalars().first()

        statement = select(Organization).where(
            Organization.data_alias == "organization_伊生診所"
        )
        result = await session.execute(statement)
        organization_esen_clinic: Organization = result.scalars().first()

        statement = select(InternalUser).where(
            InternalUser.data_alias == "internal_user_wilson_tsou"
        )
        result = await session.execute(statement)
        internal_user_wilson_tsou: InternalUser = result.scalars().first()

        statement = select(InternalUser).where(
            InternalUser.data_alias == "internal_user_shawn_tsou"
        )
        result = await session.execute(statement)
        internal_user_shawn_tsou: InternalUser = result.scalars().first()

        statement = select(InternalUser).where(
            InternalUser.data_alias == "internal_user_minnie_lin"
        )
        result = await session.execute(statement)
        internal_user_minnie_lin: InternalUser = result.scalars().first()

        statement = select(InternalUser).where(
            InternalUser.data_alias == "internal_user_莊子璇"
        )
        result = await session.execute(statement)
        internal_user_莊子璇: InternalUser = result.scalars().first()

        permission_permission_reader = Permission(
            data_alias="permission_permission_reader",
            reference="bc2d8912-d45a-403e-8808-51abc55bc3c1",
            identifier_key="PERMISSION_READER",
        )
        permission_permission_editor = Permission(
            data_alias="permission_permission_editor",
            reference="69c34d82-a8be-4b37-8dcc-84ee00de04fb",
            identifier_key="PERMISSION_EDITOR",
        )
        esen_company_board_team = Team(
            data_alias="organization_伊生股份有限公司_team_board",
            reference="2f3f1244-6725-4b96-9f54-34330f08e02d",
            display_name="董事會",
            team_permissions=[
                TeamPermission(permission=permission_permission_reader),
                TeamPermission(permission=permission_permission_editor),
            ],
            team_internal_users=[
                TeamInternalUser(
                    data_alias="organization_伊生股份有限公司_team_board_internal_user_wilson_tsou",
                    reference="562502ec-683e-46e0-87bd-3927c1b89525",
                    internal_user=internal_user_wilson_tsou,
                )
            ],
        )
        esen_clinic_board_team = Team(
            data_alias="organization_伊生診所_team_board",
            reference="c14df0dc-3686-480a-b823-313a09ee1511",
            display_name="董事會",
            team_permissions=[
                TeamPermission(permission=permission_permission_reader),
                TeamPermission(permission=permission_permission_editor),
            ],
            team_internal_users=[
                TeamInternalUser(
                    data_alias="organization_伊生診所_team_board_internal_user_wilson_tsou",
                    reference="58a95670-fa94-4d6f-a813-4ac846047846",
                    internal_user=internal_user_wilson_tsou,
                )
            ],
        )
        session.add_all([esen_company_board_team, esen_clinic_board_team])

        session.add_all(
            [
                OrganizationInternalUser(
                    reference="f225affd-6554-4c72-8ae9-5b76706fb000",
                    data_alias="organization_esen_company_internal_user_wilson_tsou",
                    organization_reference=organization_esen_company.reference,
                    internal_user=internal_user_wilson_tsou,
                    position="執行長",
                    employment_state=OrganizationInternalUser.EmploymentStateEnum.EMPLOYED.value,
                ),
                OrganizationInternalUser(
                    reference="1585e555-cd3e-4cbe-b8c0-6bca0055cec3",
                    data_alias="organization_esen_company_internal_user_shawn_tsou",
                    organization_reference=organization_esen_company.reference,
                    internal_user=internal_user_shawn_tsou,
                    position="個案管理師",
                    employment_state=OrganizationInternalUser.EmploymentStateEnum.EMPLOYED.value,
                ),
                OrganizationInternalUser(
                    reference="c97cc304-5dc2-4ec5-94de-1e68e334cc78",
                    data_alias="organization_esen_company_internal_user_minnie_lin",
                    organization_reference=organization_esen_company.reference,
                    internal_user=internal_user_minnie_lin,
                    position="行銷總監",
                    employment_state=OrganizationInternalUser.EmploymentStateEnum.EMPLOYED.value,
                ),
                OrganizationInternalUser(
                    reference="691c7172-6843-4645-a112-9bfb6550f058",
                    data_alias="organization_伊生診所_internal_user_wilson_tsou",
                    organization_reference=organization_esen_clinic.reference,
                    internal_user=internal_user_wilson_tsou,
                    position="院長",
                    employment_state=OrganizationInternalUser.EmploymentStateEnum.EMPLOYED.value,
                ),
                OrganizationInternalUser(
                    reference="39cc6109-8297-420a-bad3-fe6e20df2e46",
                    data_alias="organization_伊生診所_internal_user_莊子璇",
                    organization_reference=organization_esen_clinic.reference,
                    internal_user=internal_user_莊子璇,
                    position="主治醫師",
                    employment_state=OrganizationInternalUser.EmploymentStateEnum.EMPLOYED.value,
                ),
            ]
        )


async def downgrade(op: DataMigration.Operation):
    raise NotImplemented
