from fastapi import APIRouter, Depends, Query

# from modules.airtable.airtable_api_client import AirtableAPIClient
# from modules.airtable.config import get_config as get_airtable_config
from modules.domain.types import Reference
from modules.service_layer.message_bus import MessageBus
from modules.web_server.dependencies.auth import service_login_required
from modules.web_server.schemas.server import ResponseSchema, StatusEnum

# from services.iam.domain import command
from services.iam.domain.views import end_user as end_user_views
from services.iam.domain.views import organization as organization_views
from services.iam.utils import PersonSchema, get_full_person_name
from services.iam.web_server.dependencies.message_bus import get_message_bus
from services.iam.web_server.schemas.end_user import (  # CreateEndUserByServiceSchema,; CreateEndUserCareAirtableEndUserByServiceSchema,; UpdateEndUserByServiceSchema,
    RetrieveCrossServiceEndUserSchema,
    RetrieveEndUserDetailSchema,
)

# from services.iam.web_server.routers.end_user import create_care_airtable_end_user
from services.iam.web_server.schemas.organization import (
    RetrieveCrossServiceOrganizationSchema,
)

router = APIRouter()


@router.get(
    "/cross_service/organizations/{organization_reference}",
    tags=["cross_service"],
    dependencies=[Depends(service_login_required)],
    response_model=ResponseSchema[RetrieveCrossServiceOrganizationSchema],
)
async def cross_service_get_organization(
    organization_reference: Reference = Query(default=None),
    bus: MessageBus = Depends(get_message_bus),
):
    if organization_reference is not None:
        async for entity in organization_views.get_organization_by_reference(
            bus.uow, organization_reference
        ):
            data = RetrieveCrossServiceOrganizationSchema.from_orm(entity)
    return ResponseSchema[RetrieveCrossServiceOrganizationSchema](
        status=StatusEnum.SUCCESS, data=data
    )


@router.get(
    "/cross_service/end_user",
    tags=["cross_service"],
    dependencies=[Depends(service_login_required)],
    response_model=ResponseSchema[RetrieveCrossServiceEndUserSchema],
)
async def cross_service_get_end_user(
    end_user_reference: Reference = Query(default=None),
    airtable_reference: str = Query(default=None),
    care_airtable_reference: str = Query(default=None),
    full_name: str = Query(default=None),
    phone_number: str = Query(default=None),
    bus: MessageBus = Depends(get_message_bus),
):
    if end_user_reference is not None:
        async for end_user in end_user_views.get_end_user_by_reference(
            bus.uow, end_user_reference
        ):
            end_user_dict = RetrieveEndUserDetailSchema.from_orm(end_user).dict()
    if airtable_reference is not None:
        async for end_user in end_user_views.get_end_user_by_clinic_airtable_reference(
            bus.uow, airtable_reference
        ):
            end_user_dict = RetrieveEndUserDetailSchema.from_orm(end_user).dict()
    if care_airtable_reference is not None:
        async for end_user in end_user_views.get_end_user_by_care_airtable_reference(
            bus.uow, care_airtable_reference
        ):
            end_user_dict = RetrieveEndUserDetailSchema.from_orm(end_user).dict()
    if full_name is not None and phone_number is not None:
        async for end_user in end_user_views.get_end_user_by_full_name_and_phone_number(
            bus.uow, full_name, phone_number
        ):
            if end_user is None:
                return ResponseSchema(status=StatusEnum.SUCCESS)
            end_user_dict = RetrieveEndUserDetailSchema.from_orm(end_user).dict()

    data = RetrieveCrossServiceEndUserSchema(
        **end_user_dict,
        full_person_name=get_full_person_name(
            person=PersonSchema(
                first_name=end_user_dict["first_name"],
                last_name=end_user_dict["last_name"],
            )
        )
    )
    return ResponseSchema[RetrieveCrossServiceEndUserSchema](
        status=StatusEnum.SUCCESS, data=data
    )


# Deprecating
# @router.post(
#     "/cross_service/end_user",
#     tags=["cross_service"],
#     dependencies=[Depends(service_login_required)],
#     response_model=ResponseSchema,
# )
# async def cross_service_create_end_user(
#     payload: CreateEndUserByServiceSchema,
#     bus: MessageBus = Depends(get_message_bus),
# ):
#     airtable_config = get_airtable_config()
#     airtable_api_client = AirtableAPIClient(airtable_config.AIRTABLE_API_KEY_EDITOR)

#     care_airtable_end_user_dict = await create_care_airtable_end_user(
#         airtable_api_client, payload.first_name, payload.last_name, payload.phone_number
#     )
#     care_airtable_reference = care_airtable_end_user_dict["id"]

#     cmd = command.CreateEndUserByService(
#         care_airtable_reference=care_airtable_reference,
#         payload=payload,
#     )
#     await bus.handle(cmd)
#     return ResponseSchema(status=StatusEnum.SUCCESS)


# Deprecating
# @router.post(
#     "/cross_service/end_user/{end_user_reference}/care_airtable_end_users",
#     tags=["cross_service"],
#     dependencies=[Depends(service_login_required)],
#     response_model=ResponseSchema,
# )
# async def cross_service_create_end_user_care_airtable_end_user(
#     end_user_reference: Reference,
#     payload: CreateEndUserCareAirtableEndUserByServiceSchema,
#     bus: MessageBus = Depends(get_message_bus),
# ):
#     airtable_config = get_airtable_config()
#     airtable_api_client = AirtableAPIClient(airtable_config.AIRTABLE_API_KEY_EDITOR)

#     care_airtable_end_user_dict = await create_care_airtable_end_user(
#         airtable_api_client, payload.first_name, payload.last_name, payload.phone_number
#     )
#     care_airtable_reference = care_airtable_end_user_dict["id"]

#     cmd = command.UpdateEndUserByService(
#         end_user_reference=end_user_reference,
#         payload=UpdateEndUserByServiceSchema(
#             care_airtable_reference=care_airtable_reference
#         ),
#     )
#     await bus.handle(cmd)
#     return ResponseSchema(status=StatusEnum.SUCCESS)
