from datetime import datetime

from sqlalchemy.future import select

from modules.database.migration import DataMigration

revision = "374710822be9"
down_revision = "d4a380d42f7c"


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
        SPLITTING_TIME = datetime(2022, 12, 1)
        statement = select(ServiceProduct).where(
            ServiceProduct.data_alias.in_(
                [
                    "service_product_organization_伊生診所_一般門診諮詢_v2",
                    "service_product_organization_伊生診所_超音波服務_v2",
                    "service_product_organization_伊生診所_深度門診諮詢_v2",
                    "service_product_organization_伊生診所_減壓門診諮詢_v2",
                    "service_product_organization_伊生診所_減敏門診諮詢_v2",
                    "service_product_organization_伊生診所_減重門診諮詢_v2",
                    "service_product_organization_伊生診所_英文門診諮詢_v2",
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
                    data_alias="service_product_organization_伊生診所_一般門診諮詢_v3",
                    reference="6d030d25-012a-4e93-a308-19e37b33a946",
                    organization_reference=ESEN_CLINIC_ORGANIZATION_REFERENCE,
                    effective_time=SPLITTING_TIME,
                    display_sku_key="一般門診諮詢",
                    display_description_key="""一般門診諮詢可針對急性症狀進行診斷與治療，開立健保藥物或慢性處方簽，同時透過看診時溝通與交流，進行生活關聯性簡易評估。

    ⚠️如沒有健保卡，需酌收自費NT$800元""",
                    non_covered_price_amount="0",
                    registration_fee_amount="200",
                    duration_in_time_slots=4,
                    service_product_insurers=[
                        ServiceProductInsurer(
                            data_alias="service_product_organization_伊生診所_一般門診諮詢_v3_NHI",
                            reference="b2d250b1-5dbe-443e-b7e2-1ab5aea3dce0",
                            insurer_reference=NHI_INSURER_REFERENCE,
                        )
                    ],
                    service_product_internal_users=[
                        ServiceProductInternalUser(
                            data_alias="service_product_organization_伊生診所_一般門診諮詢_v3_鄒為之",
                            reference="99dfc7c5-99c2-4e44-adf4-17114d71d6ea",
                            internal_user_reference=INTERNAL_USER_鄒為之_REFERENCE,
                        ),
                        ServiceProductInternalUser(
                            data_alias="service_product_organization_伊生診所_一般門診諮詢_v3_莊子璇",
                            reference="45774ddf-2968-496e-961f-df39f5c89ce4",
                            internal_user_reference=INTERNAL_USER_莊子璇_REFERENCE,
                        ),
                    ],
                ),
                ServiceProduct(
                    data_alias="service_product_organization_伊生診所_超音波服務_v3",
                    reference="7a70337f-7103-43f7-afce-538acf6ddf3e",
                    organization_reference=ESEN_CLINIC_ORGANIZATION_REFERENCE,
                    effective_time=SPLITTING_TIME,
                    display_sku_key="超音波服務",
                    display_description_key="超音波檢查是一種基於超音波的醫學影像診斷技術，使肌肉和內臟器官等軟組織可視化，包括其尺寸、結構和病理學病灶。能更直觀的協助醫生做診斷判讀。超音波檢測費用另計，每個部位1800元。",
                    non_covered_price_amount="0",
                    registration_fee_amount="200",
                    duration_in_time_slots=4,
                    service_product_insurers=[
                        ServiceProductInsurer(
                            data_alias="service_product_organization_伊生診所_超音波服務_v3_NHI",
                            reference="1149abf7-1c1c-446a-9fd8-bece5700483c",
                            insurer_reference=NHI_INSURER_REFERENCE,
                        )
                    ],
                    service_product_internal_users=[
                        ServiceProductInternalUser(
                            data_alias="service_product_organization_伊生診所_超音波服務_v3_鄒為之",
                            reference="db9039eb-a10c-4e75-95fe-6b4d96b975a1",
                            internal_user_reference=INTERNAL_USER_鄒為之_REFERENCE,
                        ),
                    ],
                ),
                ServiceProduct(
                    data_alias="service_product_organization_伊生診所_深度門診諮詢_v3",
                    reference="83faa0f7-16cf-4534-ae9f-4147c09a0b68",
                    organization_reference=ESEN_CLINIC_ORGANIZATION_REFERENCE,
                    effective_time=SPLITTING_TIME,
                    display_sku_key="深度門診諮詢",
                    display_description_key="深度門診諮詢可進行全方位深度病史的詢問，幫助貴賓了解目前身體的狀況，釐清長期健康問題，透過詳細的報告解說及衛教知識提供，擬定全方位健康進化計畫，幫助達到健康管理的目的。",
                    non_covered_price_amount="0",
                    registration_fee_amount="1500",
                    duration_in_time_slots=6,
                    service_product_internal_users=[
                        ServiceProductInternalUser(
                            data_alias="service_product_organization_伊生診所_深度門診諮詢_v3_鄒為之",
                            reference="f03bae88-f3f9-4a53-b2a2-e5f8afb1d9b7",
                            internal_user_reference=INTERNAL_USER_鄒為之_REFERENCE,
                        ),
                        ServiceProductInternalUser(
                            data_alias="service_product_organization_伊生診所_深度門診諮詢_v3_莊子璇",
                            reference="cc1119d2-ea1f-44e1-8145-e43dded54289",
                            internal_user_reference=INTERNAL_USER_莊子璇_REFERENCE,
                        ),
                    ],
                ),
                ServiceProduct(
                    data_alias="service_product_organization_伊生診所_減壓門診諮詢_v3",
                    reference="288ef1a7-7e99-4032-921c-d668f24362b8",
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
                            data_alias="service_product_organization_伊生診所_減壓門診諮詢_v3_鄒為之",
                            reference="35be400d-d267-4652-b891-7f399dbddcfb",
                            internal_user_reference=INTERNAL_USER_鄒為之_REFERENCE,
                        ),
                        ServiceProductInternalUser(
                            data_alias="service_product_organization_伊生診所_減壓門診諮詢_v3_莊子璇",
                            reference="5727a5e0-41d9-4e09-bd4a-9c1952caa625",
                            internal_user_reference=INTERNAL_USER_莊子璇_REFERENCE,
                        ),
                    ],
                ),
                ServiceProduct(
                    data_alias="service_product_organization_伊生診所_減敏門診諮詢_v3",
                    reference="23b681f3-6e83-4634-91ef-b9099e27777d",
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
                            data_alias="service_product_organization_伊生診所_減敏門診諮詢_v3_鄒為之",
                            reference="b53265ed-2a69-4d26-ba00-229444434ac4",
                            internal_user_reference=INTERNAL_USER_鄒為之_REFERENCE,
                        ),
                        ServiceProductInternalUser(
                            data_alias="service_product_organization_伊生診所_減敏門診諮詢_v3_莊子璇",
                            reference="ac23f147-8c37-4251-b0cb-7c451173062e",
                            internal_user_reference=INTERNAL_USER_莊子璇_REFERENCE,
                        ),
                    ],
                ),
                ServiceProduct(
                    data_alias="service_product_organization_伊生診所_減重門診諮詢_v3",
                    reference="8efe7be7-9285-48c6-a0bd-013937244403",
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
                            data_alias="service_product_organization_伊生診所_減重門診諮詢_v3_鄒為之",
                            reference="49dc9790-2c8b-4cf3-900e-86d7440a1a93",
                            internal_user_reference=INTERNAL_USER_鄒為之_REFERENCE,
                        ),
                        ServiceProductInternalUser(
                            data_alias="service_product_organization_伊生診所_減重門診諮詢_v3_莊子璇",
                            reference="4ec89598-b6dc-4396-81c3-b915b8a40fa2",
                            internal_user_reference=INTERNAL_USER_莊子璇_REFERENCE,
                        ),
                    ],
                ),
                ServiceProduct(
                    data_alias="service_product_organization_伊生診所_英文門診諮詢_v3",
                    reference="a9c6881e-dd99-4c5e-a557-6f32dbd79c37",
                    organization_reference=ESEN_CLINIC_ORGANIZATION_REFERENCE,
                    effective_time=SPLITTING_TIME,
                    display_sku_key="一般門診諮詢 (English-speaking service)",
                    display_description_key="General consultation (一般門診諮詢) offers initial diagnosis, NHI drugs prescription, and initial lifestyle-oriented symptom assessment for acute symptoms. This service is provided for non-Mandarin speakers. Those without National Health Insurance card upon visit will be charged NT$ 800.",
                    non_covered_price_amount="0",
                    registration_fee_amount="200",
                    duration_in_time_slots=4,
                    service_product_insurers=[
                        ServiceProductInsurer(
                            data_alias="service_product_organization_伊生診所_英文門診諮詢_v3_NHI",
                            reference="2d4c5992-b192-403b-8882-87fad4e2a0f2",
                            insurer_reference=NHI_INSURER_REFERENCE,
                        )
                    ],
                    service_product_internal_users=[
                        ServiceProductInternalUser(
                            data_alias="service_product_organization_伊生診所_英文門診諮詢_v3_鄒為之",
                            reference="ce812dee-9e5a-4460-91a5-e2a649b18763",
                            internal_user_reference=INTERNAL_USER_鄒為之_REFERENCE,
                        ),
                    ],
                ),
            ]
        )


async def downgrade(op: DataMigration.Operation):
    raise NotImplemented
