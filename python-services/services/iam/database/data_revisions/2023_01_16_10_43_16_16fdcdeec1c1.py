from modules.database.migration import DataMigration

revision = "16fdcdeec1c1"
down_revision = "ab33cdb2df3d"


async def upgrade(op: DataMigration.Operation):
    from services.iam.adapter.repositories.organization import OrganizationRepository
    from services.iam.adapter.repositories.organization_internal_user import (
        OrganizationInternalUserRepository,
    )
    from services.iam.domain.models.internal_user import InternalUser
    from services.iam.domain.models.organization_internal_user import (
        OrganizationInternalUser,
    )

    async with op.acquire_db_session() as session:
        organization_repository = OrganizationRepository(session)
        organization_internal_user_repository = OrganizationInternalUserRepository(
            session
        )
        organization_esen_clinic = await organization_repository.get_by(
            data_alias="organization_伊生診所"
        )
        await organization_internal_user_repository.add(
            OrganizationInternalUser(
                data_alias="organization_伊生診所_internal_user_veronica",
                reference="dd148994-791c-4331-a365-63509965ae75",
                organization_reference=organization_esen_clinic.reference,
                position="護理師",
                employment_state=OrganizationInternalUser.EmploymentStateEnum.EMPLOYED.value,
                internal_user=InternalUser(
                    data_alias="internal_user_veronica",
                    reference="e145bde1-47f8-4ddf-9c70-e76f4c832e44",
                    first_name="筠妮",
                    last_name="林",
                    email_address="yunni0530@gmail.com",
                    password_salt="e05a18c3b4",
                    hashed_password="9b1f424e90469516aa6a95711ac899463f1e4902ce27a717cc6a4560c0a5f919",
                    avatar_src="https://picsum.photos/id/237/64/64",
                ),
            )
        )
        await organization_internal_user_repository.add(
            OrganizationInternalUser(
                data_alias="organization_伊生診所_internal_user_zoe",
                reference="4a12b7d2-1de9-4e9a-964c-73078d38252a",
                organization_reference=organization_esen_clinic.reference,
                position="護理師",
                employment_state=OrganizationInternalUser.EmploymentStateEnum.EMPLOYED.value,
                internal_user=InternalUser(
                    data_alias="internal_user_zoe",
                    reference="10128565-a27a-4a69-84e9-051be7ba479a",
                    first_name="育萱",
                    last_name="陳",
                    email_address="zoe@esenmedical.com",
                    password_salt="e05a18c3b4",
                    hashed_password="9b1f424e90469516aa6a95711ac899463f1e4902ce27a717cc6a4560c0a5f919",
                    avatar_src="https://picsum.photos/id/237/64/64",
                ),
            )
        )
        await organization_internal_user_repository.add(
            OrganizationInternalUser(
                data_alias="organization_伊生診所_internal_user_ginny",
                reference="d3014cc9-8a24-4cab-8ca0-c49046eb68c6",
                organization_reference=organization_esen_clinic.reference,
                position="營運客服專員",
                employment_state=OrganizationInternalUser.EmploymentStateEnum.EMPLOYED.value,
                internal_user=InternalUser(
                    data_alias="internal_user_ginny",
                    reference="8f375483-6a19-4a5d-8459-2470f16f38a7",
                    first_name="靖芳",
                    last_name="黃",
                    email_address="ginny4424@gmail.com",
                    password_salt="e05a18c3b4",
                    hashed_password="9b1f424e90469516aa6a95711ac899463f1e4902ce27a717cc6a4560c0a5f919",
                    avatar_src="https://picsum.photos/id/237/64/64",
                ),
            )
        )
        await organization_internal_user_repository.add(
            OrganizationInternalUser(
                data_alias="organization_伊生診所_internal_user_nami",
                reference="d02e4b5a-aab0-4502-8b05-40535348f639",
                organization_reference=organization_esen_clinic.reference,
                position="營運客服專員",
                employment_state=OrganizationInternalUser.EmploymentStateEnum.EMPLOYED.value,
                internal_user=InternalUser(
                    data_alias="internal_user_nami",
                    reference="86760af5-6c04-40e2-a4f3-b4de004dff29",
                    first_name="藝心",
                    last_name="賴",
                    email_address="r62582003y@gmail.com",
                    password_salt="e05a18c3b4",
                    hashed_password="9b1f424e90469516aa6a95711ac899463f1e4902ce27a717cc6a4560c0a5f919",
                    avatar_src="https://picsum.photos/id/237/64/64",
                ),
            )
        )


async def downgrade(op: DataMigration.Operation):
    raise NotImplemented
