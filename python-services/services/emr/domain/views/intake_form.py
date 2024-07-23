from urllib.parse import urlencode

from modules.airtable.airtable_api_client import AirtableAPIClient
from modules.airtable.config import get_config as get_airtable_config
from modules.airtable.enum import BaseEnum, TableEnum
from modules.cross_service.cross_service_api_agent import CrossServiceAPIClient
from modules.domain.types import Reference
from modules.web_server.config import get_config as get_web_server_config
from services.emr.service_layer.unit_of_work import SqlAlchemyUnitOfWork
from services.emr.web_server.schemas.intake_form import RetrieveEndUserIntakeFormSchema


async def get_end_user_intake_form_by_end_user_reference(
    uow: SqlAlchemyUnitOfWork, end_user_reference: Reference
) -> RetrieveEndUserIntakeFormSchema:
    web_server_config = get_web_server_config()
    airtable_config = get_airtable_config()

    cross_service_api_client = CrossServiceAPIClient(web_server_config.IAM_API_HOST)
    end_user_dict = await cross_service_api_client.get(
        "/cross_service/end_user", params={"end_user_reference": end_user_reference}
    )

    airtable_reference = end_user_dict.get("airtable_reference")
    if airtable_reference is None:
        return RetrieveEndUserIntakeFormSchema(is_finished=True)

    airtable_api_client = AirtableAPIClient(airtable_config.AIRTABLE_API_KEY)
    airtable_end_user_dict = await airtable_api_client.get_record_by_id(
        BaseEnum.ESEN_CLINIC, TableEnum.EHR_MASTERSHEET, airtable_reference
    )

    is_finished = airtable_end_user_dict.get("fields", {}).get("是否已填寫初診單", False)
    query_string = urlencode(
        {
            "prefill_系統編號": airtable_reference,
            "prefill_👋 姓名": end_user_dict["full_person_name"],
            "prefill_🎫 身分證字號": end_user_dict.get("tw_identity_card_number", ""),
            "prefill_👫 生理性別": {
                "MALE": "生理男 Male",
                "FEMALE": "生理女 Female",
                "NON_BINARY": "非二元性別 Non-binary",
            }.get(end_user_dict["gender"]),
            "prefill_🎂 出生年月日": end_user_dict["birth_date"],
            "hide_系統編號": "true",
            "hide_🎫 身分證字號": "true",
            "hide_👫 生理性別": "true",
            "hide_🎂 出生年月日": "true",
        }
    )
    return RetrieveEndUserIntakeFormSchema(
        is_finished=is_finished,
        url=f"https://airtable.com/shrKquMl7xJ96uvLS?{query_string}",
    )
