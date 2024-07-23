from modules.database.migration import DataMigration
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload

revision = "9979b303767c"
down_revision = "712595e05c22"


async def upgrade(op: DataMigration.Operation):
    from services.iam.domain.models.permission import Permission
    from services.iam.domain.models.team import Team
    from services.iam.domain.models.team_permission import TeamPermission

    async with op.acquire_db_session() as session:
        permission_iam_reader = Permission(
            data_alias="permission_iam_reader",
            reference="17122165-2cd8-43d3-8015-39344d95a00c",
            identifier_key="IAM_READER",
        )
        permission_iam_editor = Permission(
            data_alias="permission_iam_editor",
            reference="7b31ab0e-008a-48e3-8843-ccbcbf509e0f",
            identifier_key="IAM_EDITOR",
        )
        statement = (
            select(Team)
            .options(joinedload(Team.team_permissions))
            .where(Team.data_alias == "organization_伊生診所_team_doctor")
        )
        result = await session.execute(statement)
        team = result.scalars().unique().first()

        team.team_permissions.append(TeamPermission(permission=permission_iam_reader))
        team.team_permissions.append(TeamPermission(permission=permission_iam_editor))


async def downgrade(op: DataMigration.Operation):
    raise NotImplemented
