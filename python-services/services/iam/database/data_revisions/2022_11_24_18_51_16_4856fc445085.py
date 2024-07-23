from sqlalchemy.future import select

from modules.database.migration import DataMigration

revision = "4856fc445085"
down_revision = "eb22681b27a6"


async def upgrade(op: DataMigration.Operation):
    from services.iam.domain.models.permission import Permission
    from services.iam.domain.models.team_permission import TeamPermission

    async with op.acquire_db_session() as session:
        statement = select(Permission)
        result = await session.execute(statement)
        permissions = result.scalars().all()
        for p in permissions:
            await session.delete(p)

        statement = select(TeamPermission)
        result = await session.execute(statement)
        team_permissions = result.scalars().all()
        for tp in team_permissions:
            await session.delete(tp)

        await session.commit()

        session.add_all(
            [
                Permission(
                    data_alias="permission_organization_reader",
                    reference="3729168d-3326-4ba0-b784-d31479a66b44",
                    identifier_key="ORGANIZATION_READER",
                    display_sequence=1,
                ),
                Permission(
                    data_alias="permission_organization_editor",
                    reference="f820ac83-b699-467b-8f46-cdf0d0f2d3b1",
                    identifier_key="ORGANIZATION_EDITOR",
                    display_sequence=1,
                ),
                Permission(
                    data_alias="permission_team_reader",
                    reference="e08d2b37-7ced-4f99-9c11-44cdeb4de6d3",
                    identifier_key="TEAM_READER",
                    display_sequence=2,
                ),
                Permission(
                    data_alias="permission_team_editor",
                    reference="49f79c6f-cce6-4a27-87cb-ea173bfcc973",
                    identifier_key="TEAM_EDITOR",
                    display_sequence=2,
                ),
                Permission(
                    data_alias="permission_internal_user_reader",
                    reference="4aa049db-4b44-4824-922e-8ecb3ec4ee01",
                    identifier_key="INTERNAL_USER_READER",
                    display_sequence=3,
                ),
                Permission(
                    data_alias="permission_internal_user_editor",
                    reference="f095c038-4ecf-492b-98d8-dab7319f56d8",
                    identifier_key="INTERNAL_USER_EDITOR",
                    display_sequence=3,
                ),
                Permission(
                    data_alias="permission_permission_reader",
                    reference="bc2d8912-d45a-403e-8808-51abc55bc3c1",
                    identifier_key="PERMISSION_READER",
                    display_sequence=4,
                ),
                Permission(
                    data_alias="permission_permission_editor",
                    reference="69c34d82-a8be-4b37-8dcc-84ee00de04fb",
                    identifier_key="PERMISSION_EDITOR",
                    display_sequence=4,
                ),
                Permission(
                    data_alias="permission_end_user_reader",
                    reference="d161d3b6-1225-4397-b62b-a93bfca315d7",
                    identifier_key="END_USER_READER",
                    display_sequence=5,
                ),
                Permission(
                    data_alias="permission_end_user_editor",
                    reference="413f9517-a49f-4a5d-8b8b-ca2daedbbf77",
                    identifier_key="END_USER_EDITOR",
                    display_sequence=5,
                ),
                Permission(
                    data_alias="permission_campaign_reader",
                    reference="e3e83877-6791-44c1-947d-1e72202c3547",
                    identifier_key="CAMPAIGN_READER",
                    display_sequence=6,
                ),
                Permission(
                    data_alias="permission_campaign_editor",
                    reference="3ffeda03-fcc0-442f-ab40-2edb4caec422",
                    identifier_key="CAMPAIGN_EDITOR",
                    display_sequence=6,
                ),
                Permission(
                    data_alias="permission_emr_reader",
                    reference="9ad0bc8e-1e70-4cbe-a75b-c82f9db3d54d",
                    identifier_key="EMR_READER",
                    display_sequence=7,
                ),
                Permission(
                    data_alias="permission_emr_editor",
                    reference="ccb4092d-77ac-4c0d-87cf-beb5cd7b0a48",
                    identifier_key="EMR_EDITOR",
                    display_sequence=7,
                ),
            ]
        )


async def downgrade(op: DataMigration.Operation):
    raise NotImplemented
