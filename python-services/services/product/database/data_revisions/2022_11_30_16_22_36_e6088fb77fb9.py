from datetime import datetime

from modules.database.migration import DataMigration

revision = "e6088fb77fb9"
down_revision = "374710822be9"


async def upgrade(op: DataMigration.Operation):
    from services.product.domain.models.care_product import CareProduct

    async with op.acquire_db_session() as session:
        ESEN_COMPANY_ORGANIZATION_REFERENCE = "094b55bd-33ff-41da-a744-0559a1a666fa"
        session.add_all(
            [
                CareProduct(
                    data_alias="care_product_ESEN精準減壓計畫精華版_beta",
                    reference="08de8e13-4317-408a-a50b-4ff7a3bf134f",
                    organization_reference=ESEN_COMPANY_ORGANIZATION_REFERENCE,
                    display_sku_key="ĒSEN精準減壓計畫 精華版",
                    non_covered_price_amount="16000",
                    effective_time=datetime(2022, 11, 29),
                    expire_time=datetime(2022, 12, 29),
                ),
                CareProduct(
                    data_alias="care_product_ESEN精準減壓計畫豪華版_beta",
                    reference="60b91c7b-2277-4daf-bf22-7b6d44be2849",
                    organization_reference=ESEN_COMPANY_ORGANIZATION_REFERENCE,
                    display_sku_key="ĒSEN精準減壓計畫 豪華版",
                    non_covered_price_amount="20999",
                    effective_time=datetime(2022, 11, 29),
                    expire_time=datetime(2022, 12, 29),
                ),
            ]
        )


async def downgrade(op: DataMigration.Operation):
    raise NotImplemented
