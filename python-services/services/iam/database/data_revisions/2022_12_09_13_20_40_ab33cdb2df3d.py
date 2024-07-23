from modules.database.migration import DataMigration

revision = "ab33cdb2df3d"
down_revision = "4856fc445085"


async def upgrade(op: DataMigration.Operation):
    from services.iam.adapter.repositories.permission import PermissionRepository
    from services.iam.adapter.repositories.service import ServiceRepository

    async with op.acquire_db_session() as session:
        permission_repository = PermissionRepository(session)
        service_repository = ServiceRepository(session)

        service_campaign = await service_repository.get_by(
            data_alias="service_campaign"
        )
        service_campaign.data_alias = "service_marketing"
        service_campaign.name = "marketing"

        permission_campaign_reader = await permission_repository.get_by(
            data_alias="permission_campaign_reader"
        )
        permission_campaign_reader.data_alias = "permission_marketing_reader"
        permission_campaign_reader.identifier_key = "MARKETING_READER"

        permission_campaign_editor = await permission_repository.get_by(
            data_alias="permission_campaign_editor"
        )
        permission_campaign_editor.data_alias = "permission_marketing_editor"
        permission_campaign_editor.identifier_key = "MARKETING_EDITOR"


async def downgrade(op: DataMigration.Operation):
    raise NotImplemented
