from datetime import datetime

from modules.database.migration import DataMigration
from sqlalchemy.future import select

revision = "d4a380d42f7c"
down_revision = "3981df5f424e"


async def upgrade(op: DataMigration.Operation):
    from services.product.domain.models.service_product import ServiceProduct
    from services.product.domain.models.service_product_insurer import (
        ServiceProductInsurer,
    )
    from services.product.domain.models.service_product_internal_user import (
        ServiceProductInternalUser,
    )

    # update expire time
    async with op.acquire_db_session() as session:
        SPLITTING_TIME = datetime(2022, 11, 3)
        statement = select(ServiceProduct).where(
            ServiceProduct.data_alias.in_(
                [
                    "service_product_organization_伊生診所_一般門診諮詢",
                    "service_product_organization_伊生診所_超音波服務",
                    "service_product_organization_伊生診所_深度門診諮詢",
                    "service_product_organization_伊生診所_減壓門診諮詢",
                    "service_product_organization_伊生診所_減敏門診諮詢",
                    "service_product_organization_伊生診所_減重門診諮詢",
                    "service_product_organization_伊生診所_英文門診諮詢",
                ]
            )
        )
        result = await session.execute(statement)
        service_products = result.scalars().all()
        for sp in service_products:
            sp.expire_time = SPLITTING_TIME

        # add new products
        ESEN_CLINIC_ORGANIZATION_REFERENCE = "0cbc6a66-4c84-4b8c-9534-0e000b1d26dc"
        NHI_INSURER_REFERENCE = "fa557cfa-58e5-4d74-a3d0-71034f19ee8d"
        INTERNAL_USER_鄒為之_REFERENCE = "d7090985-a958-4b2d-a9ee-2a60ed74fe86"
        INTERNAL_USER_莊子璇_REFERENCE = "92767711-f37d-41da-b5e1-6545622bf2ec"
        session.add_all(
            [
                ServiceProduct(
                    data_alias="service_product_organization_伊生診所_一般門診諮詢_v2",
                    reference="966b30f2-bf81-4297-88f3-a91b105b90fa",
                    organization_reference=ESEN_CLINIC_ORGANIZATION_REFERENCE,
                    effective_time=SPLITTING_TIME,
                    display_sku_key="一般門診諮詢",
                    display_description_key="""一般門診諮詢可針對急性症狀進行診斷與治療，開立健保藥物或慢性處方簽，同時透過看診時溝通與交流，進行生活關聯性簡易評估。

    ⚠️如沒有健保卡，需酌收自費NT$800元""",
                    non_covered_price_amount="0",
                    registration_fee_amount="300",
                    duration_in_time_slots=4,
                    service_product_insurers=[
                        ServiceProductInsurer(
                            data_alias="service_product_organization_伊生診所_一般門診諮詢_v2_NHI",
                            reference="dfd8fa06-753f-4541-b7af-e453976d0632",
                            insurer_reference=NHI_INSURER_REFERENCE,
                        )
                    ],
                    service_product_internal_users=[
                        ServiceProductInternalUser(
                            data_alias="service_product_organization_伊生診所_一般門診諮詢_v2_鄒為之",
                            reference="979e5ecb-dbfc-4762-bf5e-15923a33cc5c",
                            internal_user_reference=INTERNAL_USER_鄒為之_REFERENCE,
                        ),
                        ServiceProductInternalUser(
                            data_alias="service_product_organization_伊生診所_一般門診諮詢_v2_莊子璇",
                            reference="715a7eb1-202c-468e-8d18-d0a4193ba840",
                            internal_user_reference=INTERNAL_USER_莊子璇_REFERENCE,
                        ),
                    ],
                ),
                ServiceProduct(
                    data_alias="service_product_organization_伊生診所_超音波服務_v2",
                    reference="5ebac607-6f41-4d5e-b3d0-30a239caf8ec",
                    organization_reference=ESEN_CLINIC_ORGANIZATION_REFERENCE,
                    effective_time=SPLITTING_TIME,
                    display_sku_key="超音波服務",
                    display_description_key="超音波檢查是一種基於超音波的醫學影像診斷技術，使肌肉和內臟器官等軟組織可視化，包括其尺寸、結構和病理學病灶。能更直觀的協助醫生做診斷判讀。超音波檢測費用另計，每個部位1800元。",
                    non_covered_price_amount="0",
                    registration_fee_amount="300",
                    duration_in_time_slots=4,
                    service_product_insurers=[
                        ServiceProductInsurer(
                            data_alias="service_product_organization_伊生診所_超音波服務_v2_NHI",
                            reference="d968ce3f-5bfa-4fce-8c29-ff390f3350c4",
                            insurer_reference=NHI_INSURER_REFERENCE,
                        )
                    ],
                    service_product_internal_users=[
                        ServiceProductInternalUser(
                            data_alias="service_product_organization_伊生診所_超音波服務_v2_鄒為之",
                            reference="088dfd20-b298-4284-b029-85e70afa4145",
                            internal_user_reference=INTERNAL_USER_鄒為之_REFERENCE,
                        ),
                    ],
                ),
                ServiceProduct(
                    data_alias="service_product_organization_伊生診所_深度門診諮詢_v2",
                    reference="14cf98c3-0cad-4c9a-b2ab-048ccb890eb8",
                    organization_reference=ESEN_CLINIC_ORGANIZATION_REFERENCE,
                    effective_time=SPLITTING_TIME,
                    display_sku_key="深度門診諮詢",
                    display_description_key="深度門診諮詢可進行全方位深度病史的詢問，幫助貴賓了解目前身體的狀況，釐清長期健康問題，透過詳細的報告解說及衛教知識提供，擬定全方位健康進化計畫，幫助達到健康管理的目的。",
                    non_covered_price_amount="0",
                    registration_fee_amount="1500",
                    duration_in_time_slots=6,
                    service_product_internal_users=[
                        ServiceProductInternalUser(
                            data_alias="service_product_organization_伊生診所_深度門診諮詢_v2_鄒為之",
                            reference="6b3b80a5-aed2-4bfb-8c25-e296dc514d34",
                            internal_user_reference=INTERNAL_USER_鄒為之_REFERENCE,
                        ),
                        ServiceProductInternalUser(
                            data_alias="service_product_organization_伊生診所_深度門診諮詢_v2_莊子璇",
                            reference="0446a6bd-827b-4fd6-b37f-33a0007811cb",
                            internal_user_reference=INTERNAL_USER_莊子璇_REFERENCE,
                        ),
                    ],
                ),
                ServiceProduct(
                    data_alias="service_product_organization_伊生診所_減壓門診諮詢_v2",
                    reference="993230ef-b1a0-422c-bcef-4d95b0f533b9",
                    organization_reference=ESEN_CLINIC_ORGANIZATION_REFERENCE,
                    effective_time=SPLITTING_TIME,
                    display_sku_key="減壓門診諮詢",
                    display_description_key="""為入門的壓力檢測方案，醫師將透過檢測，精準判別您的失眠、焦慮、壓力問題。
    此方案包含：
    • 自律神經儀檢測一次
    • 自律神經儀檢測報告解說一次
    • 建議搭配壓力賀爾蒙檢測
    以上方案僅適用初診預約；可與另外兩種門診方案並用""",
                    non_covered_price_amount="0",
                    registration_fee_amount="1800",
                    duration_in_time_slots=4,
                    service_product_internal_users=[
                        ServiceProductInternalUser(
                            data_alias="service_product_organization_伊生診所_減壓門診諮詢_v2_鄒為之",
                            reference="2100dad5-52f8-434f-bb45-7deabc12792d",
                            internal_user_reference=INTERNAL_USER_鄒為之_REFERENCE,
                        ),
                        ServiceProductInternalUser(
                            data_alias="service_product_organization_伊生診所_減壓門診諮詢_v2_莊子璇",
                            reference="8cfa780d-bbf1-4ed9-b9e3-d53c9dbb65ed",
                            internal_user_reference=INTERNAL_USER_莊子璇_REFERENCE,
                        ),
                    ],
                ),
                ServiceProduct(
                    data_alias="service_product_organization_伊生診所_減敏門診諮詢_v2",
                    reference="c30d7d33-7d92-4adb-b7a8-c060b848b846",
                    organization_reference=ESEN_CLINIC_ORGANIZATION_REFERENCE,
                    effective_time=SPLITTING_TIME,
                    display_sku_key="減敏門診諮詢",
                    display_description_key="""為入門過敏原檢測方案，幫助醫師快速檢測您發炎數值並調節免疫力。
    此方案包含：
    • IgE 免疫球蛋白E指數檢測一次
    • 免疫調節點滴療程一次
    以上方案僅適用初診預約；可與另外兩種門診方案並用""",
                    non_covered_price_amount="0",
                    registration_fee_amount="2500",
                    duration_in_time_slots=4,
                    service_product_internal_users=[
                        ServiceProductInternalUser(
                            data_alias="service_product_organization_伊生診所_減敏門診諮詢_v2_鄒為之",
                            reference="d0ef4b65-d40a-498b-a84f-52a90ed6a246",
                            internal_user_reference=INTERNAL_USER_鄒為之_REFERENCE,
                        ),
                        ServiceProductInternalUser(
                            data_alias="service_product_organization_伊生診所_減敏門診諮詢_v2_莊子璇",
                            reference="56766e22-72e8-420b-9054-09c9f5c2529f",
                            internal_user_reference=INTERNAL_USER_莊子璇_REFERENCE,
                        ),
                    ],
                ),
                ServiceProduct(
                    data_alias="service_product_organization_伊生診所_減重門診諮詢_v2",
                    reference="6a46c0df-fd62-4c58-a085-61d774d0973a",
                    organization_reference=ESEN_CLINIC_ORGANIZATION_REFERENCE,
                    effective_time=SPLITTING_TIME,
                    display_sku_key="減重門診諮詢",
                    display_description_key="""為入門代謝檢測方案，幫助醫師確認您的肥胖原因，找到減重下一步。
    此方案包含：
    • ESEN 經典健檢，36項血液檢測一次
    • HS CRP 高靈敏度C反應蛋白檢測一次
    • 胰島素阻抗檢測一次
    • 體脂測量一次
    以上方案僅適用初診預約；可與另外兩種門診方案並用""",
                    non_covered_price_amount="0",
                    registration_fee_amount="2500",
                    duration_in_time_slots=4,
                    service_product_internal_users=[
                        ServiceProductInternalUser(
                            data_alias="service_product_organization_伊生診所_減重門診諮詢_v2_鄒為之",
                            reference="610959df-a804-405c-949e-3a5125b97a8d",
                            internal_user_reference=INTERNAL_USER_鄒為之_REFERENCE,
                        ),
                        ServiceProductInternalUser(
                            data_alias="service_product_organization_伊生診所_減重門診諮詢_v2_莊子璇",
                            reference="aa886549-1678-4048-aa79-e6e91ede1f2f",
                            internal_user_reference=INTERNAL_USER_莊子璇_REFERENCE,
                        ),
                    ],
                ),
                ServiceProduct(
                    data_alias="service_product_organization_伊生診所_英文門診諮詢_v2",
                    reference="bd1b8279-59ff-45de-a2ac-9f56efa417ff",
                    organization_reference=ESEN_CLINIC_ORGANIZATION_REFERENCE,
                    effective_time=SPLITTING_TIME,
                    display_sku_key="一般門診諮詢 (English-speaking service)",
                    display_description_key="General consultation (一般門診諮詢) offers initial diagnosis, NHI drugs prescription, and initial lifestyle-oriented symptom assessment for acute symptoms. This service is provided for non-Mandarin speakers. Those without National Health Insurance card upon visit will be charged NT$ 800.",
                    non_covered_price_amount="0",
                    registration_fee_amount="300",
                    duration_in_time_slots=4,
                    service_product_insurers=[
                        ServiceProductInsurer(
                            data_alias="service_product_organization_伊生診所_英文門診諮詢_v2_NHI",
                            reference="8cb17041-174b-4605-9731-fa9914ee5c23",
                            insurer_reference=NHI_INSURER_REFERENCE,
                        )
                    ],
                    service_product_internal_users=[
                        ServiceProductInternalUser(
                            data_alias="service_product_organization_伊生診所_英文門診諮詢_v2_鄒為之",
                            reference="11efcaa4-253b-42dc-8f56-21c04df5453f",
                            internal_user_reference=INTERNAL_USER_鄒為之_REFERENCE,
                        ),
                    ],
                ),
            ]
        )


async def downgrade(op: DataMigration.Operation):
    raise NotImplemented
