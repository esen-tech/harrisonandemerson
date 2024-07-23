from datetime import datetime

from modules.database.migration import DataMigration

revision = "803ace3591d0"
down_revision = "2c2987314408"


async def upgrade(op: DataMigration.Operation):
    from services.iam.domain.models.service import Service
    from services.iam.domain.models.service_access_token import ServiceAccessToken

    async with op.acquire_db_session() as session:
        product_service = Service(
            data_alias="service_product",
            reference="7df7c8a7-1d4e-401a-9139-31f4a1c367ff",
            name="product",
        )
        product_service_access_token = ServiceAccessToken(
            value="HmGmmSVG52KefurF",
            expiration_time=datetime.max,
            is_active=True,
            service=product_service,
        )
        session.add(product_service)
        session.add(product_service_access_token)


async def downgrade(op: DataMigration.Operation):
    raise NotImplemented
