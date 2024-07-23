from datetime import datetime

from sqlalchemy.future import select

from modules.database.migration import DataMigration

revision = "73da05e063ba"
down_revision = "ea1a13957fec"


async def upgrade(op: DataMigration.Operation):
    from services.iam.domain.models.internal_user import InternalUser
    from services.iam.domain.models.organization import Organization
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
            InternalUser.data_alias == "internal_user_shawn_tsou"
        )
        result = await session.execute(statement)
        internal_user_shawn_tsou: InternalUser = result.scalars().first()

        statement = select(Permission).where(
            Permission.data_alias == "permission_emr_reader"
        )
        result = await session.execute(statement)
        permission_emr_reader: Permission = result.scalars().first()

        statement = select(Permission).where(
            Permission.data_alias == "permission_emr_editor"
        )
        result = await session.execute(statement)
        permission_emr_editor: Permission = result.scalars().first()

        internal_user_田靜宜 = InternalUser(
            data_alias="internal_user_田靜宜",
            reference="687b854a-7123-4874-8bc6-abb350ee39e0",
            first_name="靜宜",
            last_name="田",
            email_address="mandy@esenmedical.com",
            password_salt="e05a18c3b4",
            hashed_password="9b1f424e90469516aa6a95711ac899463f1e4902ce27a717cc6a4560c0a5f919",
        )
        internal_user_李聆寗 = InternalUser(
            data_alias="internal_user_李聆寗",
            reference="d92f8935-b912-4fae-8bda-828f97ddf2eb",
            first_name="聆寗",
            last_name="李",
            email_address="lillian@esenmedical.com",
            password_salt="e05a18c3b4",
            hashed_password="9b1f424e90469516aa6a95711ac899463f1e4902ce27a717cc6a4560c0a5f919",
        )
        internal_user_翁治平 = InternalUser(
            data_alias="internal_user_翁治平",
            reference="c884feb0-6d00-4aba-9f7e-50971ba65406",
            first_name="治平",
            last_name="翁",
            email_address="cp@esenmedical.com",
            password_salt="e05a18c3b4",
            hashed_password="9b1f424e90469516aa6a95711ac899463f1e4902ce27a717cc6a4560c0a5f919",
        )
        internal_user_謝瀚陞 = InternalUser(
            data_alias="internal_user_謝瀚陞",
            reference="dfc798ed-f7f5-430f-96ef-b708d864e625",
            first_name="瀚陞",
            last_name="謝",
            email_address="henk@esenmedical.com",
            password_salt="e05a18c3b4",
            hashed_password="9b1f424e90469516aa6a95711ac899463f1e4902ce27a717cc6a4560c0a5f919",
        )
        internal_user_吳奕雲 = InternalUser(
            data_alias="internal_user_吳奕雲",
            reference="63d21cf6-92fd-449c-a6a1-74af90e9ece1",
            first_name="奕雲",
            last_name="吳",
            email_address="hebe@esenmedical.com",
            password_salt="e05a18c3b4",
            hashed_password="9b1f424e90469516aa6a95711ac899463f1e4902ce27a717cc6a4560c0a5f919",
        )
        internal_user_王羿柔 = InternalUser(
            data_alias="internal_user_王羿柔",
            reference="2a59374e-1689-418b-a0ec-c133ed8802a3",
            first_name="羿柔",
            last_name="王",
            email_address="henk@esenmedical.com",
            password_salt="e05a18c3b4",
            hashed_password="9b1f424e90469516aa6a95711ac899463f1e4902ce27a717cc6a4560c0a5f919",
        )
        session.add_all(
            [
                internal_user_田靜宜,
                internal_user_李聆寗,
                internal_user_翁治平,
                internal_user_謝瀚陞,
                internal_user_吳奕雲,
            ]
        )
        session.add_all(
            [
                OrganizationInternalUser(
                    reference="5ae88d3b-c087-49a9-83ec-ae87da3e1979",
                    data_alias="organization_esen_company_internal_user_田靜宜",
                    organization_reference=organization_esen_clinic.reference,
                    internal_user=internal_user_田靜宜,
                    position="營運總監",
                    employment_state=OrganizationInternalUser.EmploymentStateEnum.EMPLOYED.value,
                ),
                OrganizationInternalUser(
                    reference="febf6a65-cd76-4cf0-bd9a-7cae2172c607",
                    data_alias="organization_esen_company_internal_user_王羿柔",
                    organization_reference=organization_esen_clinic.reference,
                    internal_user=internal_user_王羿柔,
                    position="護理師",
                    last_resign_time=datetime(2022, 10, 1),
                    employment_state=OrganizationInternalUser.EmploymentStateEnum.NOT_EMPLOYED.value,
                ),
                OrganizationInternalUser(
                    reference="f0a17180-a687-49f5-90b2-0ae7bb4fa795",
                    data_alias="organization_esen_company_internal_user_李聆寗",
                    organization_reference=organization_esen_company.reference,
                    internal_user=internal_user_李聆寗,
                    position="個案管理師",
                    employment_state=OrganizationInternalUser.EmploymentStateEnum.EMPLOYED.value,
                ),
                OrganizationInternalUser(
                    reference="6937ed55-525a-4e60-b4c5-e9095fce4793",
                    data_alias="organization_esen_company_internal_user_翁治平",
                    organization_reference=organization_esen_company.reference,
                    internal_user=internal_user_翁治平,
                    position="工程師",
                    employment_state=OrganizationInternalUser.EmploymentStateEnum.EMPLOYED.value,
                ),
                OrganizationInternalUser(
                    reference="c9f2da35-ef3f-46d3-95de-c5d20f225839",
                    data_alias="organization_esen_company_internal_user_謝瀚陞",
                    organization_reference=organization_esen_company.reference,
                    internal_user=internal_user_謝瀚陞,
                    position="設計師",
                    employment_state=OrganizationInternalUser.EmploymentStateEnum.EMPLOYED.value,
                ),
                OrganizationInternalUser(
                    reference="8fce558f-3311-4a39-beef-15764078e878",
                    data_alias="organization_esen_company_internal_user_吳奕雲",
                    organization_reference=organization_esen_company.reference,
                    internal_user=internal_user_吳奕雲,
                    position="營運總監",
                    employment_state=OrganizationInternalUser.EmploymentStateEnum.EMPLOYED.value,
                ),
            ]
        )

        session.add_all(
            [
                Team(
                    data_alias="organization_伊生診所_team_營運團隊",
                    reference="c7a92ff7-1981-449e-bce2-4f053ae8ddaa",
                    organization=organization_esen_clinic,
                    display_name="營運團隊",
                    team_permissions=[
                        TeamPermission(permission=permission_emr_reader),
                    ],
                    team_internal_users=[
                        TeamInternalUser(
                            data_alias="organization_伊生診所_internal_user_田靜宜",
                            reference="8c4ea1c4-3f28-4c2f-91eb-cb749a0690bf",
                            internal_user=internal_user_田靜宜,
                        ),
                    ],
                ),
                Team(
                    data_alias="organization_伊生股份有限公司_team_軟體團隊",
                    reference="715d914f-39a7-44a6-9b13-b7bd11ad543b",
                    organization=organization_esen_company,
                    display_name="軟體團隊",
                    team_permissions=[
                        TeamPermission(permission=permission_emr_reader),
                        TeamPermission(permission=permission_emr_editor),
                    ],
                    team_internal_users=[
                        TeamInternalUser(
                            data_alias="organization_伊生股份有限公司_internal_user_翁治平",
                            reference="a4541713-4b3b-43f9-9ae1-b9b9b811d944",
                            internal_user=internal_user_翁治平,
                        ),
                        TeamInternalUser(
                            data_alias="organization_伊生股份有限公司_internal_user_謝瀚陞",
                            reference="61506ab4-1c5b-4323-acfa-024d59ccbe2b",
                            internal_user=internal_user_謝瀚陞,
                        ),
                    ],
                ),
                Team(
                    data_alias="organization_伊生股份有限公司_team_健管團隊",
                    reference="3eedafac-59ac-431b-889b-6cf6c8fd9a80",
                    organization=organization_esen_company,
                    display_name="健管團隊",
                    team_permissions=[
                        TeamPermission(permission=permission_emr_reader),
                        TeamPermission(permission=permission_emr_editor),
                    ],
                    team_internal_users=[
                        TeamInternalUser(
                            data_alias="organization_伊生股份有限公司_internal_user_shawn_tsou",
                            reference="c71a886b-b078-439a-b672-1e4ff33f18f0",
                            internal_user=internal_user_shawn_tsou,
                        ),
                        TeamInternalUser(
                            data_alias="organization_伊生股份有限公司_internal_user_李聆寗",
                            reference="e3ecfd61-00c2-4636-a314-2baa172dfe50",
                            internal_user=internal_user_李聆寗,
                        ),
                    ],
                ),
                Team(
                    data_alias="organization_伊生股份有限公司_team_營運團隊",
                    reference="f8b28821-24ba-448b-a1aa-c7a70102ff98",
                    organization=organization_esen_company,
                    display_name="營運團隊",
                    team_permissions=[
                        TeamPermission(permission=permission_emr_reader),
                        TeamPermission(permission=permission_emr_editor),
                    ],
                    team_internal_users=[
                        TeamInternalUser(
                            data_alias="organization_伊生股份有限公司_internal_user_吳奕雲",
                            reference="ae8f7373-8e45-4e55-a78c-4ed6f0e0dc3a",
                            internal_user=internal_user_吳奕雲,
                        ),
                    ],
                ),
            ]
        )


async def downgrade(op: DataMigration.Operation):
    raise NotImplemented
