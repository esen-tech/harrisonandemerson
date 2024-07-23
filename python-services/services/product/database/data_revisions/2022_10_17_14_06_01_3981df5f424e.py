from modules.database.migration import DataMigration

revision = "3981df5f424e"
down_revision = None


async def upgrade(op: DataMigration.Operation):
    from services.product.domain.models.service_product import ServiceProduct
    from services.product.domain.models.service_product_insurer import (
        ServiceProductInsurer,
    )
    from services.product.domain.models.service_product_internal_user import (
        ServiceProductInternalUser,
    )

    ESEN_CLINIC_ORGANIZATION_REFERENCE = "0cbc6a66-4c84-4b8c-9534-0e000b1d26dc"
    NHI_INSURER_REFERENCE = "fa557cfa-58e5-4d74-a3d0-71034f19ee8d"
    INTERNAL_USER_鄒為之_REFERENCE = "d7090985-a958-4b2d-a9ee-2a60ed74fe86"
    INTERNAL_USER_莊子璇_REFERENCE = "92767711-f37d-41da-b5e1-6545622bf2ec"

    async with op.acquire_db_session() as session:
        session.add_all(
            [
                ServiceProduct(
                    data_alias="service_product_organization_伊生診所_一般門診諮詢",
                    reference="60831928-dc90-4256-afcf-6c8a3339c1bc",
                    organization_reference=ESEN_CLINIC_ORGANIZATION_REFERENCE,
                    display_sku_key="一般門診諮詢",
                    display_description_key="""一般門診諮詢可針對急性症狀進行診斷與治療，開立健保藥物或慢性處方簽，同時透過看診時溝通與交流，進行生活關聯性簡易評估。

⚠️如沒有健保卡，需酌收自費NT$800元""",
                    non_covered_price_amount="0",
                    registration_fee_amount="300",
                    duration_in_time_slots=3,
                    service_product_insurers=[
                        ServiceProductInsurer(
                            data_alias="service_product_organization_伊生診所_一般門診諮詢_NHI",
                            reference="3ab8c265-e02f-400d-9b7b-f2d8c855f366",
                            insurer_reference=NHI_INSURER_REFERENCE,
                        )
                    ],
                    service_product_internal_users=[
                        ServiceProductInternalUser(
                            data_alias="service_product_organization_伊生診所_一般門診諮詢_鄒為之",
                            reference="9724749b-d7ae-499b-bebd-074ebb15eb8b",
                            internal_user_reference=INTERNAL_USER_鄒為之_REFERENCE,
                        ),
                        ServiceProductInternalUser(
                            data_alias="service_product_organization_伊生診所_一般門診諮詢_莊子璇",
                            reference="1b235c5a-4d75-44bb-a9b8-b6eb72fdccbf",
                            internal_user_reference=INTERNAL_USER_莊子璇_REFERENCE,
                        ),
                    ],
                ),
                ServiceProduct(
                    data_alias="service_product_organization_伊生診所_超音波服務",
                    reference="38fcd686-f3ae-4739-a5b2-050f46275e57",
                    organization_reference=ESEN_CLINIC_ORGANIZATION_REFERENCE,
                    display_sku_key="超音波服務",
                    display_description_key="超音波檢查是一種基於超音波的醫學影像診斷技術，使肌肉和內臟器官等軟組織可視化，包括其尺寸、結構和病理學病灶。能更直觀的協助醫生做診斷判讀。超音波檢測費用另計，每個部位1800元。",
                    non_covered_price_amount="0",
                    registration_fee_amount="300",
                    duration_in_time_slots=3,
                    service_product_insurers=[
                        ServiceProductInsurer(
                            data_alias="service_product_organization_伊生診所_超音波服務_NHI",
                            reference="e13f5675-db28-4e0e-b9a1-e87c9b806d9e",
                            insurer_reference=NHI_INSURER_REFERENCE,
                        )
                    ],
                    service_product_internal_users=[
                        ServiceProductInternalUser(
                            data_alias="service_product_organization_伊生診所_超音波服務_鄒為之",
                            reference="310c61f9-eee8-44b0-b0f4-2c6ad3dce9a8",
                            internal_user_reference=INTERNAL_USER_鄒為之_REFERENCE,
                        ),
                    ],
                ),
                ServiceProduct(
                    data_alias="service_product_organization_伊生診所_深度門診諮詢",
                    reference="427daa8c-3f73-4b34-aa16-31e786c5b7d9",
                    organization_reference=ESEN_CLINIC_ORGANIZATION_REFERENCE,
                    display_sku_key="深度門診諮詢",
                    display_description_key="深度門診諮詢可進行全方位深度病史的詢問，幫助貴賓了解目前身體的狀況，釐清長期健康問題，透過詳細的報告解說及衛教知識提供，擬定全方位健康進化計畫，幫助達到健康管理的目的。",
                    non_covered_price_amount="0",
                    registration_fee_amount="1500",
                    duration_in_time_slots=6,
                    service_product_internal_users=[
                        ServiceProductInternalUser(
                            data_alias="service_product_organization_伊生診所_深度門診諮詢_鄒為之",
                            reference="6448b3e5-faf7-440e-a3ad-62d9178dda11",
                            internal_user_reference=INTERNAL_USER_鄒為之_REFERENCE,
                        ),
                        ServiceProductInternalUser(
                            data_alias="service_product_organization_伊生診所_深度門診諮詢_莊子璇",
                            reference="3f29a262-d14a-4050-9d58-96794ae2d70c",
                            internal_user_reference=INTERNAL_USER_莊子璇_REFERENCE,
                        ),
                    ],
                ),
                ServiceProduct(
                    data_alias="service_product_organization_伊生診所_減壓門診諮詢",
                    reference="1926ce5f-566d-4570-a10d-633cc21bf417",
                    organization_reference=ESEN_CLINIC_ORGANIZATION_REFERENCE,
                    display_sku_key="減壓門診諮詢",
                    display_description_key="""為入門的壓力檢測方案，醫師將透過檢測，精準判別您的失眠、焦慮、壓力問題。
此方案包含：
• 自律神經儀檢測一次
• 自律神經儀檢測報告解說一次
• 建議搭配壓力賀爾蒙檢測
以上方案僅適用初診預約；可與另外兩種門診方案並用""",
                    non_covered_price_amount="0",
                    registration_fee_amount="1800",
                    duration_in_time_slots=3,
                    service_product_internal_users=[
                        ServiceProductInternalUser(
                            data_alias="service_product_organization_伊生診所_減壓門診諮詢_鄒為之",
                            reference="083cef1f-7aca-417e-8eef-4364ae1776c0",
                            internal_user_reference=INTERNAL_USER_鄒為之_REFERENCE,
                        ),
                        ServiceProductInternalUser(
                            data_alias="service_product_organization_伊生診所_減壓門診諮詢_莊子璇",
                            reference="7ca8e22d-c6b6-490f-80b1-d26dc9f1c149",
                            internal_user_reference=INTERNAL_USER_莊子璇_REFERENCE,
                        ),
                    ],
                ),
                ServiceProduct(
                    data_alias="service_product_organization_伊生診所_減敏門診諮詢",
                    reference="c60ec99f-4c5f-4b7a-96a9-90560cd4b009",
                    organization_reference=ESEN_CLINIC_ORGANIZATION_REFERENCE,
                    display_sku_key="減敏門診諮詢",
                    display_description_key="""為入門過敏原檢測方案，幫助醫師快速檢測您發炎數值並調節免疫力。
此方案包含：
• IgE 免疫球蛋白E指數檢測一次
• 免疫調節點滴療程一次
以上方案僅適用初診預約；可與另外兩種門診方案並用""",
                    non_covered_price_amount="0",
                    registration_fee_amount="2500",
                    duration_in_time_slots=3,
                    service_product_internal_users=[
                        ServiceProductInternalUser(
                            data_alias="service_product_organization_伊生診所_減敏門診諮詢_鄒為之",
                            reference="4a419a1f-6040-46aa-b45c-507d67124aa6",
                            internal_user_reference=INTERNAL_USER_鄒為之_REFERENCE,
                        ),
                        ServiceProductInternalUser(
                            data_alias="service_product_organization_伊生診所_減敏門診諮詢_莊子璇",
                            reference="085c79f5-e0b5-445b-8ac0-88b6aeb8b05e",
                            internal_user_reference=INTERNAL_USER_莊子璇_REFERENCE,
                        ),
                    ],
                ),
                ServiceProduct(
                    data_alias="service_product_organization_伊生診所_減重門診諮詢",
                    reference="f1b082c6-c312-45a9-ada4-f350d2ded253",
                    organization_reference=ESEN_CLINIC_ORGANIZATION_REFERENCE,
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
                    duration_in_time_slots=3,
                    service_product_internal_users=[
                        ServiceProductInternalUser(
                            data_alias="service_product_organization_伊生診所_減重門診諮詢_鄒為之",
                            reference="6db073b0-7151-402c-bc44-0e8fbadd1840",
                            internal_user_reference=INTERNAL_USER_鄒為之_REFERENCE,
                        ),
                        ServiceProductInternalUser(
                            data_alias="service_product_organization_伊生診所_減重門診諮詢_莊子璇",
                            reference="5973c13f-4f58-4450-8dde-7c945e0af05b",
                            internal_user_reference=INTERNAL_USER_莊子璇_REFERENCE,
                        ),
                    ],
                ),
                ServiceProduct(
                    data_alias="service_product_organization_伊生診所_英文門診諮詢",
                    reference="295f528d-c376-4525-be04-2f0ddc0d582a",
                    organization_reference=ESEN_CLINIC_ORGANIZATION_REFERENCE,
                    display_sku_key="一般門診諮詢 (English-speaking service)",
                    display_description_key="General consultation (一般門診諮詢) offers initial diagnosis, NHI drugs prescription, and initial lifestyle-oriented symptom assessment for acute symptoms. This service is provided for non-Mandarin speakers. Those without National Health Insurance card upon visit will be charged NT$ 800.",
                    non_covered_price_amount="0",
                    registration_fee_amount="300",
                    duration_in_time_slots=3,
                    service_product_insurers=[
                        ServiceProductInsurer(
                            data_alias="service_product_organization_伊生診所_英文門診諮詢_NHI",
                            reference="84b4367b-c9d4-4712-9520-d7a339bd9b26",
                            insurer_reference=NHI_INSURER_REFERENCE,
                        )
                    ],
                    service_product_internal_users=[
                        ServiceProductInternalUser(
                            data_alias="service_product_organization_伊生診所_英文門診諮詢_鄒為之",
                            reference="b0425d41-f2c1-49d3-91c5-cfb76cb8d8a4",
                            internal_user_reference=INTERNAL_USER_鄒為之_REFERENCE,
                        ),
                    ],
                ),
            ]
        )


async def downgrade(op: DataMigration.Operation):
    raise NotImplemented
