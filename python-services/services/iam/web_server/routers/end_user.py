import random
import string
import uuid
from datetime import timedelta
from typing import List

from fastapi import APIRouter, Depends, Query, Request, Response
from sqlalchemy import or_

from core.exceptions import EsenException
from modules.airtable.airtable_api_client import AirtableAPIClient
from modules.airtable.config import get_config as get_airtable_config
from modules.airtable.enum import BaseEnum, TableEnum
from modules.domain.types import Reference, cast_date_to_string
from modules.domain.views.view_enhancer import EnhancedViewSchema, ViewEnhancement
from modules.service_layer.message_bus import MessageBus
from modules.web_server.config import get_config as get_web_server_config
from modules.web_server.dependencies.auth import (
    end_user_login_required,
    get_current_end_user,
    internal_user_identifier_keys_required,
    internal_user_login_required,
)
from modules.web_server.exceptions import EsenBadRequestError, EsenUnauthorizedError
from modules.web_server.schemas.server import ResponseSchema, StatusEnum
from modules.web_server.schemas.user import CurrentEndUserSchema
from services.iam.config import get_config
from services.iam.domain import command
from services.iam.domain.models.end_user import EndUser
from services.iam.domain.views import end_user as end_user_views
from services.iam.domain.views.filter_view_enhancer import end_user_filter_view_enhancer
from services.iam.domain.views.page_view_enhancer import end_user_page_view_enhancer
from services.iam.service_layer.handlers import InvalidOneTimePassword, MultipleEndUser
from services.iam.utils import PersonSchema, get_full_person_name
from services.iam.web_server.dependencies.message_bus import get_message_bus
from services.iam.web_server.schemas.end_user import (
    CreateEndUserByInternalUserSchema,
    CreateEndUserLoginIntentSchema,
    CreateEndUserSignupIntentSchema,
    LoginEndUserSchema,
    RetrieveEndUserDetailSchema,
    RetrieveEndUserSummarySchema,
    SignupEndUserSchema,
    UpdateEndUserSchema,
    VerifyEndUserSignupIntentSchema,
)

router = APIRouter()


async def has_been_registered(
    bus: MessageBus,
    phone_number: str | None = None,
    email_address: str | None = None,
    include_clinic_airtable: bool = False,
    include_care_airtable: bool = False,
) -> bool:
    airtable_config = get_airtable_config()
    airtable_api_client = AirtableAPIClient(airtable_config.AIRTABLE_API_KEY)
    async with bus.uow:
        if phone_number is not None:
            end_users = await bus.uow.end_user_repository.get_all_by(
                phone_number=phone_number
            )
            if len(end_users) == 0:
                clinic_airtable_end_users = []
                if include_clinic_airtable:
                    clinic_airtable_end_users_page = await airtable_api_client.get_paged_records(
                        BaseEnum.ESEN_CLINIC,
                        TableEnum.EHR_MASTERSHEET,
                        filter_by_formula=f"{{手機號碼 Phone No. - reformatted}}='{phone_number}'",
                    )
                    clinic_airtable_end_users = clinic_airtable_end_users_page.get(
                        "records", []
                    )

                care_airtable_end_users = []
                if include_care_airtable:
                    care_airtable_end_users_page = (
                        await airtable_api_client.get_paged_records(
                            BaseEnum.ESEN_CARE,
                            TableEnum.客戶,
                            filter_by_formula=f"{{手機號碼}}='{phone_number}'",
                        )
                    )
                    care_airtable_end_users = care_airtable_end_users_page.get(
                        "records", []
                    )

                if (
                    len(clinic_airtable_end_users) >= 1
                    or len(care_airtable_end_users) >= 1
                ):
                    return True
                else:
                    return False
            elif len(end_users) >= 1:
                return True
        elif email_address is not None:
            end_users = await bus.uow.end_user_repository.get_all_by(
                email_address=email_address
            )
            if len(end_users) == 0:
                clinic_airtable_end_users = []
                if include_clinic_airtable:
                    clinic_airtable_end_users_page = await airtable_api_client.get_paged_records(
                        BaseEnum.ESEN_CLINIC,
                        TableEnum.EHR_MASTERSHEET,
                        filter_by_formula=f"{{電子郵件 Email Address}}='{email_address}'",
                    )
                    clinic_airtable_end_users = clinic_airtable_end_users_page.get(
                        "records", []
                    )

                care_airtable_end_users = []
                if include_care_airtable:
                    raise NotImplementedError

                if (
                    len(clinic_airtable_end_users) >= 1
                    or len(care_airtable_end_users) >= 1
                ):
                    return True
                else:
                    return False
            elif len(end_users) >= 1:
                return True


async def create_care_airtable_end_user(
    airtable_api_client: AirtableAPIClient,
    first_name: str | None,
    last_name: str | None,
    phone_number: str,
) -> dict:
    care_airtable_end_user = await airtable_api_client.create_record(
        BaseEnum.ESEN_CARE,
        TableEnum.客戶,
        {
            "姓名": get_full_person_name(
                PersonSchema(first_name=first_name, last_name=last_name)
            ),
            "手機號碼": phone_number,
        },
    )
    care_airtable_reference = care_airtable_end_user.get("id")
    if care_airtable_reference is None:
        raise EsenException("Failed to create this account on care airtable")
    return care_airtable_end_user


@router.get(
    "/end_users",
    tags=["end_user"],
    response_model=ResponseSchema[List[RetrieveEndUserSummarySchema]],
)
async def get_end_users(
    references: List[Reference] = Query(default=None),
    bus: MessageBus = Depends(get_message_bus),
):
    async for entities in end_user_views.get_end_users_by_references(
        bus.uow, references
    ):
        return ResponseSchema[List[RetrieveEndUserSummarySchema]](
            status=StatusEnum.SUCCESS,
            data=[RetrieveEndUserSummarySchema.from_orm(entity) for entity in entities],
        )


@router.post(
    "/end_users/signup_intents",
    tags=["end_user"],
    response_model=ResponseSchema,
)
async def create_end_user_signup_intent(
    payload: CreateEndUserSignupIntentSchema,
    response: Response,
    bus: MessageBus = Depends(get_message_bus),
):
    if await has_been_registered(
        bus,
        email_address=payload.email_address,
        phone_number=payload.phone_number,
        include_clinic_airtable=True,
    ):
        raise EsenBadRequestError("This account has been registered")

    serial_number = "".join(random.choice(string.ascii_uppercase) for _ in range(4))
    otp_value = "".join(random.choice(string.digits) for _ in range(6))
    token_age = timedelta(minutes=5)
    await bus.handle(
        command.CreateEndUserSignupIntent(
            request_token_serial_number=serial_number,
            request_token_otp_value=otp_value,
            request_token_token_age=token_age,
            payload=payload,
        )
    )
    config = get_config()
    response.set_cookie(
        key=config.OTP_TOKEN_SERIAL_NUMBER_SIGNUP_INTENT_COOKIE_KEY,
        value=serial_number,
        max_age=token_age.total_seconds(),
        secure=True,
        httponly=True,
        domain=config.OTP_TOKEN_COOKIE_DOMAIN,
    )
    return ResponseSchema(status=StatusEnum.SUCCESS)


@router.post(
    "/end_users/signup_intents/current/verify",
    tags=["end_user"],
    response_model=ResponseSchema[str],
)
async def verify_end_user_signup_intent(
    payload: VerifyEndUserSignupIntentSchema,
    request: Request,
    response: Response,
    bus: MessageBus = Depends(get_message_bus),
):
    config = get_config()
    resolve_token_serial_number = request.cookies.get(
        config.OTP_TOKEN_SERIAL_NUMBER_SIGNUP_INTENT_COOKIE_KEY
    )

    request_token_serial_number = "".join(
        random.choice(string.ascii_uppercase) for _ in range(4)
    )
    request_token_otp_value = "".join(random.choice(string.digits) for _ in range(6))
    request_token_token_age = timedelta(minutes=15)
    try:
        cmd = command.VerifyEndUserSignupIntent(
            resolve_token_serial_number=resolve_token_serial_number,
            request_token_serial_number=request_token_serial_number,
            request_token_otp_value=request_token_otp_value,
            request_token_token_age=request_token_token_age,
            payload=payload,
        )
        await bus.handle(cmd)
    except InvalidOneTimePassword as e:
        raise EsenUnauthorizedError(e)

    response.set_cookie(
        key=config.OTP_TOKEN_SERIAL_NUMBER_VERIFY_SIGNUP_INTENT_COOKIE_KEY,
        value=request_token_serial_number,
        max_age=request_token_token_age.total_seconds(),
        secure=True,
        httponly=True,
        domain=config.OTP_TOKEN_COOKIE_DOMAIN,
    )

    return ResponseSchema[str](status=StatusEnum.SUCCESS, data=request_token_otp_value)


@router.post(
    "/end_users/signup",
    tags=["end_user"],
    response_model=ResponseSchema[RetrieveEndUserSummarySchema],
)
async def signup_end_user(
    payload: SignupEndUserSchema,
    request: Request,
    response: Response,
    bus: MessageBus = Depends(get_message_bus),
):
    config = get_config()
    airtable_config = get_airtable_config()
    airtable_api_client = AirtableAPIClient(airtable_config.AIRTABLE_API_KEY_EDITOR)

    resolve_token_serial_number = request.cookies.get(
        config.OTP_TOKEN_SERIAL_NUMBER_VERIFY_SIGNUP_INTENT_COOKIE_KEY
    )
    request_access_token_value = uuid.uuid4().hex
    request_access_token_token_age = timedelta(days=30)

    if await has_been_registered(
        bus,
        email_address=payload.email_address,
        phone_number=payload.phone_number,
        include_clinic_airtable=True,
    ):
        raise EsenBadRequestError("This account has been registered")

    airtable_end_users_page = await airtable_api_client.get_paged_records(
        BaseEnum.ESEN_CLINIC,
        TableEnum.EHR_MASTERSHEET,
        filter_by_formula=f"{{手機號碼 Phone No. - reformatted}}='{payload.phone_number}'",
    )
    airtable_end_users = airtable_end_users_page.get("records", [])
    if len(airtable_end_users) == 0:
        airtable_end_user = await airtable_api_client.create_record(
            BaseEnum.ESEN_CLINIC,
            TableEnum.EHR_MASTERSHEET,
            {
                "姓名 Full Name": get_full_person_name(
                    PersonSchema(
                        first_name=payload.first_name, last_name=payload.last_name
                    )
                ),
                "手機號碼 Phone No.": payload.phone_number,
                "出生年月日 Date of Birth": cast_date_to_string(payload.birth_date),
                "身分證字號 National ID No.": payload.tw_identity_card_number,
                "電子郵件 Email Address": payload.email_address,
                "性別 Gender": {
                    EndUser.GenderEnum.MALE.value: "生理男 Male",
                    EndUser.GenderEnum.FEMALE.value: "生理女 Female",
                    EndUser.GenderEnum.NON_BINARY.value: "非二元性別 Non-binary",
                }.get(payload.gender),
            },
        )
    else:
        airtable_end_user = next(aeu for aeu in airtable_end_users)

    airtable_reference = airtable_end_user.get("id")
    if airtable_reference is None:
        raise EsenException("Unable to register this account")

    reference = uuid.uuid4()
    try:
        cmd = command.SignupEndUser(
            resolve_token_serial_number=resolve_token_serial_number,
            resolve_token_otp_value=payload.token,
            request_access_token_value=request_access_token_value,
            request_access_token_token_age=request_access_token_token_age,
            reference=reference,
            airtable_reference=airtable_reference,
            payload=payload,
        )
        await bus.handle(cmd)
    except InvalidOneTimePassword as e:
        raise EsenUnauthorizedError(e)

    web_server_config = get_web_server_config()
    response.set_cookie(
        key=web_server_config.END_USER_ACCESS_TOKEN_COOKIE_KEY,
        value=request_access_token_value,
        max_age=request_access_token_token_age.total_seconds(),
        secure=True,
        httponly=True,
        domain=config.END_USER_ACCESS_TOKEN_COOKIE_DOMAIN,
    )
    return ResponseSchema[RetrieveEndUserSummarySchema](
        status=StatusEnum.SUCCESS,
        data=RetrieveEndUserSummarySchema(reference=reference),
    )


@router.post(
    "/organizations/{organization_reference}/end_users",
    tags=["end_user"],
    dependencies=[
        Depends(internal_user_login_required),
        # Depends(internal_user_identifier_keys_required({"END_USER_EDITOR"})),
    ],
    response_model=ResponseSchema[RetrieveEndUserSummarySchema],
)
async def create_end_user_by_internal_user(
    organization_reference: Reference,
    payload: CreateEndUserByInternalUserSchema,
    bus: MessageBus = Depends(get_message_bus),
):
    # airtable_config = get_airtable_config()
    # airtable_api_client = AirtableAPIClient(airtable_config.AIRTABLE_API_KEY_EDITOR)

    if await has_been_registered(
        bus,
        phone_number=payload.phone_number,
        include_care_airtable=True,
    ):
        raise EsenBadRequestError("This account has been registered")

    # care_airtable_end_user_dict = await create_care_airtable_end_user(
    #     airtable_api_client, payload.first_name, payload.last_name, payload.phone_number
    # )
    # care_airtable_reference = care_airtable_end_user_dict["id"]

    reference = uuid.uuid4()
    cmd = command.CreateEndUserByInternalUser(
        reference=reference,
        # care_airtable_reference=care_airtable_reference,
        payload=payload,
    )
    await bus.handle(cmd)

    return ResponseSchema(
        status=StatusEnum.SUCCESS,
        data=RetrieveEndUserSummarySchema(reference=reference),
    )


@router.post(
    "/end_users/login_intents",
    tags=["end_user"],
    response_model=ResponseSchema,
)
async def create_end_user_login_intent(
    payload: CreateEndUserLoginIntentSchema,
    response: Response,
    bus: MessageBus = Depends(get_message_bus),
):
    async with bus.uow:
        if payload.phone_number is not None:
            end_users = await bus.uow.end_user_repository.get_all_by(
                or_(EndUser.is_guest == None, EndUser.is_guest == False),
                phone_number=payload.phone_number,
            )
            if len(end_users) == 0:
                airtable_config = get_airtable_config()
                airtable_api_client = AirtableAPIClient(
                    airtable_config.AIRTABLE_API_KEY
                )
                airtable_end_users_page = await airtable_api_client.get_paged_records(
                    BaseEnum.ESEN_CLINIC,
                    TableEnum.EHR_MASTERSHEET,
                    filter_by_formula=f"{{手機號碼 Phone No. - reformatted}}='{payload.phone_number}'",
                )
                airtable_end_users = airtable_end_users_page.get("records", [])
                if len(airtable_end_users) == 0 or len(airtable_end_users) > 1:
                    raise EsenBadRequestError("Invalid account")

                airtable_end_user = next(aeu for aeu in airtable_end_users)
                await bus.handle(
                    command.CreateEndUserFromAirtableEndUser(
                        phone_number=payload.phone_number,
                        airtable_end_user=airtable_end_user,
                    )
                )
            elif len(end_users) > 1:
                raise EsenBadRequestError("Invalid account")
        elif payload.email_address is not None:
            end_users = await bus.uow.end_user_repository.get_all_by(
                or_(EndUser.is_guest == None, EndUser.is_guest == False),
                email_address=payload.email_address,
            )
            if len(end_users) == 0:
                airtable_config = get_airtable_config()
                airtable_api_client = AirtableAPIClient(
                    airtable_config.AIRTABLE_API_KEY
                )
                airtable_end_users_page = await airtable_api_client.get_paged_records(
                    BaseEnum.ESEN_CLINIC,
                    TableEnum.EHR_MASTERSHEET,
                    filter_by_formula=f"{{電子郵件 Email Address}}='{payload.email_address}'",
                )
                airtable_end_users = airtable_end_users_page.get("records", [])
                if len(airtable_end_users) == 0 or len(airtable_end_users) > 1:
                    raise EsenBadRequestError("Invalid account")

                airtable_end_user = next(aeu for aeu in airtable_end_users)
                await bus.handle(
                    command.CreateEndUserFromAirtableEndUser(
                        phone_number=payload.phone_number,
                        airtable_end_user=airtable_end_user,
                    )
                )
            elif len(end_users) > 1:
                raise EsenBadRequestError("Invalid account")
    serial_number = "".join(random.choice(string.ascii_uppercase) for _ in range(4))
    token_age = timedelta(minutes=5)
    await bus.handle(
        command.CreateEndUserLoginIntent(
            request_token_serial_number=serial_number,
            request_token_otp_value="".join(
                random.choice(string.digits) for _ in range(6)
            ),
            request_token_token_age=token_age,
            payload=payload,
        )
    )
    config = get_config()
    response.set_cookie(
        key=config.OTP_TOKEN_SERIAL_NUMBER_LOGIN_INTENT_COOKIE_KEY,
        value=serial_number,
        max_age=token_age.total_seconds(),
        secure=True,
        httponly=True,
        domain=config.OTP_TOKEN_COOKIE_DOMAIN,
    )
    return ResponseSchema(status=StatusEnum.SUCCESS)


@router.post(
    "/end_users/login",
    tags=["end_user"],
    response_model=ResponseSchema,
)
async def login_end_user(
    payload: LoginEndUserSchema,
    request: Request,
    response: Response,
    bus: MessageBus = Depends(get_message_bus),
):
    config = get_config()
    resolve_token_serial_number = request.cookies.get(
        config.OTP_TOKEN_SERIAL_NUMBER_LOGIN_INTENT_COOKIE_KEY
    )
    request_access_token_value = uuid.uuid4().hex
    request_access_token_token_age = timedelta(days=30)
    try:
        cmd = command.LoginEndUser(
            resolve_token_serial_number=resolve_token_serial_number,
            resolve_token_otp_value=payload.one_time_password,
            request_access_token_value=request_access_token_value,
            request_access_token_token_age=request_access_token_token_age,
            payload=payload,
        )
        await bus.handle(cmd)
    except InvalidOneTimePassword as e:
        raise EsenUnauthorizedError(e)
    except MultipleEndUser as e:
        raise EsenUnauthorizedError(e)

    web_server_config = get_web_server_config()
    response.set_cookie(
        key=web_server_config.END_USER_ACCESS_TOKEN_COOKIE_KEY,
        value=request_access_token_value,
        max_age=request_access_token_token_age.total_seconds(),
        secure=True,
        httponly=True,
        domain=config.END_USER_ACCESS_TOKEN_COOKIE_DOMAIN,
    )
    return ResponseSchema(status=StatusEnum.SUCCESS)


@router.post(
    "/end_users/logout",
    tags=["end_user"],
    response_model=ResponseSchema,
)
async def logout_end_user(
    request: Request,
    response: Response,
    bus: MessageBus = Depends(get_message_bus),
):
    web_server_config = get_web_server_config()
    access_token_value = request.cookies.get(
        web_server_config.END_USER_ACCESS_TOKEN_COOKIE_KEY
    )
    cmd = command.LogoutEndUser(access_token_value=access_token_value)
    await bus.handle(cmd)
    response.set_cookie(
        key=web_server_config.END_USER_ACCESS_TOKEN_COOKIE_KEY,
        value="",
        max_age=0,
    )
    return ResponseSchema(status=StatusEnum.SUCCESS)


@router.get(
    "/end_users/current_from_access_token",
    tags=["end_user"],
    response_model=ResponseSchema[CurrentEndUserSchema],
)
async def get_current_end_user_from_access_token(
    request: Request, bus: MessageBus = Depends(get_message_bus)
):
    web_server_config = get_web_server_config()
    data = await end_user_views.get_end_user_by_access_token_value(
        bus.uow, request.cookies.get(web_server_config.END_USER_ACCESS_TOKEN_COOKIE_KEY)
    )
    if data is None:
        raise EsenUnauthorizedError()
    return ResponseSchema[CurrentEndUserSchema](status=StatusEnum.SUCCESS, data=data)


@router.get(
    "/end_users/me",
    tags=["end_user"],
    dependencies=[Depends(end_user_login_required)],
    response_model=ResponseSchema[RetrieveEndUserDetailSchema],
)
async def get_current_end_user_detail(
    end_user: CurrentEndUserSchema = Depends(get_current_end_user),
    bus: MessageBus = Depends(get_message_bus),
):
    async for data in end_user_views.get_end_user_by_reference(
        bus.uow, end_user.reference
    ):
        return ResponseSchema[RetrieveEndUserDetailSchema](
            status=StatusEnum.SUCCESS, data=data
        )


@router.patch(
    "/end_users/me",
    tags=["end_user"],
    dependencies=[Depends(end_user_login_required)],
    response_model=ResponseSchema,
)
async def update_current_end_user_detail(
    payload: UpdateEndUserSchema,
    end_user: CurrentEndUserSchema = Depends(get_current_end_user),
    bus: MessageBus = Depends(get_message_bus),
):
    cmd = command.UpdateEndUser(
        end_user_reference=end_user.reference,
        payload=payload,
    )
    await bus.handle(cmd)
    return ResponseSchema(status=StatusEnum.SUCCESS)


@router.get(
    "/organizations/{organization_reference}/end_users",
    tags=["end_user"],
    dependencies=[
        Depends(internal_user_login_required),
        Depends(internal_user_identifier_keys_required({"EMR_READER"})),
    ],
    response_model=ResponseSchema[
        EnhancedViewSchema[List[RetrieveEndUserSummarySchema]]
    ],
)
async def get_end_users(
    organization_reference: Reference,
    filter_context=Depends(end_user_filter_view_enhancer.get_context),
    page_context=Depends(end_user_page_view_enhancer.get_context),
    bus: MessageBus = Depends(get_message_bus),
):
    data = await end_user_views.get_end_users_by_filter_and_page(
        bus.uow,
        ViewEnhancement(enhancer=end_user_filter_view_enhancer, context=filter_context),
        ViewEnhancement(enhancer=end_user_page_view_enhancer, context=page_context),
    )
    return ResponseSchema[EnhancedViewSchema[List[RetrieveEndUserSummarySchema]]](
        status=StatusEnum.SUCCESS, data=data
    )


@router.get(
    "/organizations/{organization_reference}/end_users/{end_user_reference}",
    tags=["end_user"],
    dependencies=[
        Depends(internal_user_login_required),
        Depends(internal_user_identifier_keys_required({"END_USER_READER"})),
    ],
    response_model=ResponseSchema[RetrieveEndUserDetailSchema],
)
async def get_end_user_detail(
    organization_reference: Reference,
    end_user_reference: Reference,
    bus: MessageBus = Depends(get_message_bus),
):
    async for data in end_user_views.get_end_user_by_reference(
        bus.uow, end_user_reference
    ):
        return ResponseSchema[RetrieveEndUserDetailSchema](
            status=StatusEnum.SUCCESS, data=data
        )
