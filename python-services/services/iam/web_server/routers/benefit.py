from typing import List

from fastapi import APIRouter, Depends
from modules.airtable.airtable_api_client import AirtableAPIClient
from modules.airtable.config import get_config as get_airtable_config
from modules.airtable.enum import BaseEnum, TableEnum
from modules.service_layer.message_bus import MessageBus
from modules.web_server.schemas.base import BaseRetrieveEntitySchema
from modules.web_server.schemas.server import ResponseSchema, StatusEnum
from pydantic import BaseModel
from services.iam.domain.models.end_user import EndUser
from services.iam.web_server.dependencies.message_bus import get_message_bus

router = APIRouter()


class RetrieveEndUserBenefitSchema(BaseModel):
    class RetrieveEndUserSchema(BaseRetrieveEntitySchema):
        first_name: str
        last_name: str

    class _RetrieveBenefitSchema(BaseModel):
        display_name: str
        is_available: bool

    membership_type: str | None
    end_user: RetrieveEndUserSchema | None
    benefits: List[_RetrieveBenefitSchema]


@router.get(
    "/benefits",
    tags=["benefit"],
    response_model=ResponseSchema[RetrieveEndUserBenefitSchema],
)
async def get_benefits(
    phone_number: str,
    bus: MessageBus = Depends(get_message_bus),
):
    async with bus.uow:
        end_users: List[EndUser] = await bus.uow.end_user_repository.get_all_by(
            phone_number=phone_number
        )

        if len(end_users) == 0:
            return ResponseSchema[RetrieveEndUserBenefitSchema](
                status=StatusEnum.SUCCESS,
                data=RetrieveEndUserBenefitSchema(end_user=None, benefits=[]),
            )
        elif len(end_users) == 1:
            airtable_config = get_airtable_config()
            airtable_api_client = AirtableAPIClient(airtable_config.AIRTABLE_API_KEY)
            end_user = end_users[0]
            airtable_end_user = await airtable_api_client.get_record_by_id(
                BaseEnum.ESEN_CLINIC,
                TableEnum.EHR_MASTERSHEET,
                end_user.airtable_reference,
            )
            membership_type = airtable_end_user.get("fields", {}).get("會員身份")
            if membership_type is None or membership_type == "ĒSEN Free":
                benefits = [
                    RetrieveEndUserBenefitSchema._RetrieveBenefitSchema(
                        display_name="女力Nuli", is_available=False
                    ),
                    RetrieveEndUserBenefitSchema._RetrieveBenefitSchema(
                        display_name="WAYPOINT", is_available=False
                    ),
                    RetrieveEndUserBenefitSchema._RetrieveBenefitSchema(
                        display_name="Cocoon Lab 繭 感官實驗室", is_available=False
                    ),
                    RetrieveEndUserBenefitSchema._RetrieveBenefitSchema(
                        display_name="TAMED FOX ", is_available=False
                    ),
                    RetrieveEndUserBenefitSchema._RetrieveBenefitSchema(
                        display_name="三徑就荒", is_available=False
                    ),
                    RetrieveEndUserBenefitSchema._RetrieveBenefitSchema(
                        display_name="裕見美", is_available=False
                    ),
                ]
            elif membership_type == "ĒSEN Care Premium":
                benefits = [
                    RetrieveEndUserBenefitSchema._RetrieveBenefitSchema(
                        display_name="女力Nuli", is_available=True
                    ),
                    RetrieveEndUserBenefitSchema._RetrieveBenefitSchema(
                        display_name="WAYPOINT", is_available=True
                    ),
                    RetrieveEndUserBenefitSchema._RetrieveBenefitSchema(
                        display_name="Cocoon Lab 繭 感官實驗室", is_available=True
                    ),
                    RetrieveEndUserBenefitSchema._RetrieveBenefitSchema(
                        display_name="TAMED FOX ", is_available=True
                    ),
                    RetrieveEndUserBenefitSchema._RetrieveBenefitSchema(
                        display_name="三徑就荒", is_available=True
                    ),
                    RetrieveEndUserBenefitSchema._RetrieveBenefitSchema(
                        display_name="裕見美", is_available=True
                    ),
                ]
            return ResponseSchema[RetrieveEndUserBenefitSchema](
                status=StatusEnum.SUCCESS,
                data=RetrieveEndUserBenefitSchema(
                    membership_type=membership_type,
                    end_user=end_user,
                    benefits=benefits,
                ),
            )
        else:
            raise NotImplemented
