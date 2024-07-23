from modules.database.migration import DataMigration

revision = "712595e05c22"
down_revision = "3d571e6c5aea"


async def upgrade(op: DataMigration.Operation):
    from services.iam.domain.models.insurer import Insurer

    async with op.acquire_db_session() as session:
        insurer = Insurer(
            data_alias="insurer_衛生福利部中央健康保險署",
            reference="fa557cfa-58e5-4d74-a3d0-71034f19ee8d",
            official_key="衛生福利部中央健康保險署",
            display_key="健保",
        )
        session.add(insurer)


async def downgrade(op: DataMigration.Operation):
    raise NotImplemented
