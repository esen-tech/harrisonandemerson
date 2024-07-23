# from datetime import datetime

from core.env import get_env
from modules.airtable.schemas.config import ConfigSchema


def get_config() -> ConfigSchema:
    airtable_staff_record_id_to_internal_user_reference_map = {
        "reclUXKyVUObDQGxf": "d7090985-a958-4b2d-a9ee-2a60ed74fe86",
        "rec35urfF1KbEI18G": "92767711-f37d-41da-b5e1-6545622bf2ec",
    }

    # utc_now = datetime.utcnow()
    # if utc_now < datetime(2022, 12, 1):
    #     service_product_reference_to_airtable_visit_門診類別_map = {
    #         "966b30f2-bf81-4297-88f3-a91b105b90fa": "一般門診諮詢",
    #         "5ebac607-6f41-4d5e-b3d0-30a239caf8ec": "超音波服務",
    #         "14cf98c3-0cad-4c9a-b2ab-048ccb890eb8": "深度門診諮詢",
    #         "993230ef-b1a0-422c-bcef-4d95b0f533b9": "減壓門診諮詢",
    #         "c30d7d33-7d92-4adb-b7a8-c060b848b846": "減敏門診諮詢",
    #         "6a46c0df-fd62-4c58-a085-61d774d0973a": "減重門診諮詢",
    #         "bd1b8279-59ff-45de-a2ac-9f56efa417ff": "一般門診諮詢 (English-speaking service)",
    #     }
    # else:
    #     service_product_reference_to_airtable_visit_門診類別_map = {
    #         "6d030d25-012a-4e93-a308-19e37b33a946": "一般門診諮詢",
    #         "7a70337f-7103-43f7-afce-538acf6ddf3e": "超音波服務",
    #         "83faa0f7-16cf-4534-ae9f-4147c09a0b68": "深度門診諮詢",
    #         "288ef1a7-7e99-4032-921c-d668f24362b8": "減壓門診諮詢",
    #         "23b681f3-6e83-4634-91ef-b9099e27777d": "減敏門診諮詢",
    #         "8efe7be7-9285-48c6-a0bd-013937244403": "減重門診諮詢",
    #         "a9c6881e-dd99-4c5e-a557-6f32dbd79c37": "一般門診諮詢 (English-speaking service)",
    #     }
    airtable_visit_門診類別_to_service_product_reference_map = {
        # v: k for k, v in service_product_reference_to_airtable_visit_門診類別_map.items()
    }
    airtable_健管師_record_id_to_internal_user_reference_map = {
        "recfxepzqYnen4wyq": "7509e211-ac46-4b96-9cad-25f8594a9a51",
        "recZtuWKkOkb4OOFu": "d92f8935-b912-4fae-8bda-828f97ddf2eb",
    }

    return ConfigSchema(
        AIRTABLE_API_KEY=get_env("AIRTABLE_API_KEY"),
        AIRTABLE_API_KEY_EDITOR=get_env("AIRTABLE_API_KEY_EDITOR"),
        ESEN_CLINIC_ORGANIZATION_REFERENCE="0cbc6a66-4c84-4b8c-9534-0e000b1d26dc",
        AIRTABLE_STAFF_RECORD_ID_TO_INTERNAL_USER_REFERENCE_MAP=airtable_staff_record_id_to_internal_user_reference_map,
        # SERVICE_PRODUCT_REFERENCE_TO_AIRTABLE_VISIT_門診類別_MAP=service_product_reference_to_airtable_visit_門診類別_map,
        AIRTABLE_VISIT_門診類別_TO_SERVICE_PRODUCT_REFERENCE_MAP=airtable_visit_門診類別_to_service_product_reference_map,
        AIRTABLE_健管師_RECORD_ID_TO_INTERNAL_USER_REFERENCE_MAP=airtable_健管師_record_id_to_internal_user_reference_map,
        EXAMINATION_REPORT_FILE_GROUP_NAME="ĒSEN Clinic 健檢報告",
    )
