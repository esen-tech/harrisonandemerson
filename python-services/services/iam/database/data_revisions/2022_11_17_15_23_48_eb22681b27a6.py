from sqlalchemy.future import select
from sqlalchemy.orm import joinedload

from modules.database.migration import DataMigration

revision = "eb22681b27a6"
down_revision = "73da05e063ba"


async def upgrade(op: DataMigration.Operation):
    from services.iam.domain.models.permission import Permission
    from services.iam.domain.models.team import Team
    from services.iam.domain.models.team_permission import TeamPermission

    async with op.acquire_db_session() as session:
        statement = select(Permission).where(
            Permission.data_alias == "permission_iam_reader"
        )
        result = await session.execute(statement)
        permission_iam_reader: Permission = result.scalars().first()

        statement = select(Permission).where(
            Permission.data_alias == "permission_iam_editor"
        )
        result = await session.execute(statement)
        permission_iam_editor: Permission = result.scalars().first()

        statement = (
            select(Team)
            .where(Team.data_alias == "organization_伊生股份有限公司_team_軟體團隊")
            .options(joinedload(Team.team_permissions))
        )
        result = await session.execute(statement)
        organization_伊生股份有限公司_team_軟體團隊: Team = result.scalars().first()

        statement = (
            select(Team)
            .where(Team.data_alias == "organization_伊生股份有限公司_team_健管團隊")
            .options(joinedload(Team.team_permissions))
        )
        result = await session.execute(statement)
        organization_伊生股份有限公司_team_健管團隊: Team = result.scalars().first()

        statement = (
            select(Team)
            .where(Team.data_alias == "organization_伊生股份有限公司_team_營運團隊")
            .options(joinedload(Team.team_permissions))
        )

        result = await session.execute(statement)
        organization_伊生股份有限公司_team_營運團隊: Team = result.scalars().first()

        organization_伊生股份有限公司_team_軟體團隊.team_permissions.extend(
            [
                TeamPermission(permission=permission_iam_reader),
                TeamPermission(permission=permission_iam_editor),
            ]
        )

        organization_伊生股份有限公司_team_健管團隊.team_permissions.extend(
            [
                TeamPermission(permission=permission_iam_reader),
            ]
        )

        organization_伊生股份有限公司_team_營運團隊.team_permissions.extend(
            [
                TeamPermission(permission=permission_iam_reader),
            ]
        )


async def downgrade(op: DataMigration.Operation):
    raise NotImplemented
