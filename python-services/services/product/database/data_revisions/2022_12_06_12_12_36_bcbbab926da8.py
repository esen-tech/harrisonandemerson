from datetime import datetime

from modules.database.migration import DataMigration

revision = "bcbbab926da8"
down_revision = "e6088fb77fb9"


async def upgrade(op: DataMigration.Operation):
    from services.product.adapter.repositories.care_product import CareProductRepository
    from services.product.domain.models.care_product import CareProduct
    from services.product.domain.models.care_product_image import CareProductImage

    async with op.acquire_db_session() as session:
        ESEN_COMPANY_ORGANIZATION_REFERENCE = "094b55bd-33ff-41da-a744-0559a1a666fa"

        care_product_repository = CareProductRepository(session)
        care_product_ESEN精準減壓計畫精華版_beta = await care_product_repository.get_by(
            data_alias="care_product_ESEN精準減壓計畫精華版_beta"
        )
        care_product_ESEN精準減壓計畫豪華版_beta = await care_product_repository.get_by(
            data_alias="care_product_ESEN精準減壓計畫豪華版_beta"
        )

        care_product_ESEN精準減壓計畫精華版_beta.care_product_images = [
            CareProductImage(src="https://picsum.photos/id/237/536/354")
        ]
        care_product_ESEN精準減壓計畫精華版_beta.delivery_order_count = 1

        care_product_ESEN精準減壓計畫豪華版_beta.care_product_images = [
            CareProductImage(src="https://picsum.photos/id/237/536/354")
        ]
        care_product_ESEN精準減壓計畫豪華版_beta.delivery_order_count = 1

        await care_product_repository.add(
            CareProduct(
                data_alias="care_product_ESEN精準減壓計畫精華版雙人套餐",
                reference="4aa4d092-238a-4c0f-99f6-ebc60b0357f9",
                organization_reference=ESEN_COMPANY_ORGANIZATION_REFERENCE,
                display_sku_key="ĒSEN精準減壓計畫 精華版 雙人套餐",
                non_covered_price_amount="32000",
                effective_time=datetime(2022, 12, 1),
                expire_time=None,
                delivery_order_count=2,
                care_product_images=[
                    CareProductImage(src="https://picsum.photos/id/123/536/354")
                ],
            )
        )
        await care_product_repository.add(
            CareProduct(
                data_alias="care_product_ESEN精準減壓計畫豪華版雙人套餐",
                reference="69e97e81-1621-4788-bd22-9a680cc2527f",
                organization_reference=ESEN_COMPANY_ORGANIZATION_REFERENCE,
                display_sku_key="ĒSEN精準減壓計畫 豪華版 雙人套餐",
                non_covered_price_amount="41998",
                effective_time=datetime(2022, 12, 1),
                expire_time=None,
                delivery_order_count=2,
                care_product_images=[
                    CareProductImage(src="https://picsum.photos/id/123/536/354")
                ],
            )
        )
        await care_product_repository.add(
            CareProduct(
                data_alias="care_product_ESEN精準減壓計畫精華版三人套餐",
                reference="931a13b7-b8c5-4222-890a-13bfcfcbf490",
                organization_reference=ESEN_COMPANY_ORGANIZATION_REFERENCE,
                display_sku_key="ĒSEN精準減壓計畫 精華版 三人套餐",
                non_covered_price_amount="48000",
                effective_time=datetime(2022, 12, 1),
                expire_time=None,
                delivery_order_count=3,
                care_product_images=[
                    CareProductImage(src="https://picsum.photos/id/456/536/354")
                ],
            )
        )
        await care_product_repository.add(
            CareProduct(
                data_alias="care_product_ESEN精準減壓計畫豪華版三人套餐",
                reference="1903480c-d118-465d-8c5b-2d1e3b557c46",
                organization_reference=ESEN_COMPANY_ORGANIZATION_REFERENCE,
                display_sku_key="ĒSEN精準減壓計畫 豪華版 三人套餐",
                non_covered_price_amount="62997",
                effective_time=datetime(2022, 12, 1),
                expire_time=None,
                delivery_order_count=3,
                care_product_images=[
                    CareProductImage(src="https://picsum.photos/id/456/536/354")
                ],
            )
        )


async def downgrade(op: DataMigration.Operation):
    raise NotImplemented
