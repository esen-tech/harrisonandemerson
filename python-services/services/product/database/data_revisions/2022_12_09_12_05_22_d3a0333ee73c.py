from modules.database.migration import DataMigration

revision = "d3a0333ee73c"
down_revision = "bcbbab926da8"


async def upgrade(op: DataMigration.Operation):
    from services.product.adapter.repositories.care_product import CareProductRepository

    async with op.acquire_db_session() as session:
        care_product_repository = CareProductRepository(session)
        care_product_ESEN精準減壓計畫精華版_beta = await care_product_repository.get_by(
            data_alias="care_product_ESEN精準減壓計畫精華版_beta"
        )
        care_product_ESEN精準減壓計畫精華版_beta.original_price_amount = "16000"
        care_product_ESEN精準減壓計畫精華版_beta.sale_price_amount = "16000"

        care_product_ESEN精準減壓計畫豪華版_beta = await care_product_repository.get_by(
            data_alias="care_product_ESEN精準減壓計畫豪華版_beta"
        )
        care_product_ESEN精準減壓計畫豪華版_beta.original_price_amount = "20999"
        care_product_ESEN精準減壓計畫豪華版_beta.sale_price_amount = "20999"

        care_product_ESEN精準減壓計畫精華版雙人套餐 = await care_product_repository.get_by(
            data_alias="care_product_ESEN精準減壓計畫精華版雙人套餐"
        )
        care_product_ESEN精準減壓計畫精華版雙人套餐.original_price_amount = "32000"
        care_product_ESEN精準減壓計畫精華版雙人套餐.sale_price_amount = "32000"

        care_product_ESEN精準減壓計畫豪華版雙人套餐 = await care_product_repository.get_by(
            data_alias="care_product_ESEN精準減壓計畫豪華版雙人套餐"
        )
        care_product_ESEN精準減壓計畫豪華版雙人套餐.original_price_amount = "41998"
        care_product_ESEN精準減壓計畫豪華版雙人套餐.sale_price_amount = "41998"

        care_product_ESEN精準減壓計畫精華版三人套餐 = await care_product_repository.get_by(
            data_alias="care_product_ESEN精準減壓計畫精華版三人套餐"
        )
        care_product_ESEN精準減壓計畫精華版三人套餐.original_price_amount = "48000"
        care_product_ESEN精準減壓計畫精華版三人套餐.sale_price_amount = "48000"

        care_product_ESEN精準減壓計畫豪華版三人套餐 = await care_product_repository.get_by(
            data_alias="care_product_ESEN精準減壓計畫豪華版三人套餐"
        )
        care_product_ESEN精準減壓計畫豪華版三人套餐.original_price_amount = "62997"
        care_product_ESEN精準減壓計畫豪華版三人套餐.sale_price_amount = "62997"


async def downgrade(op: DataMigration.Operation):
    raise NotImplemented
