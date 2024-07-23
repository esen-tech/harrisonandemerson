import uuid
from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends

from modules.cross_service.cross_service_api_agent import CrossServiceAPIClient
from modules.domain.types import Reference, cast_string_to_datetime
from modules.domain.views.filter_view_enhancer import FilterContextSchema
from modules.domain.views.load_view_enhancer import LoadContextSchema
from modules.domain.views.view_enhancer import EnhancedViewSchema, ViewEnhancement
from modules.service_layer.message_bus import MessageBus
from modules.web_server.config import get_config as get_web_server_config
from modules.web_server.dependencies.auth import (
    end_user_login_required,
    get_current_end_user,
    internal_user_login_required,
)
from modules.web_server.exceptions import EsenBadRequestError, EsenPermissionDeniedError
from modules.web_server.schemas.server import ResponseSchema, StatusEnum
from modules.web_server.schemas.user import CurrentEndUserSchema
from services.scheduling.domain import command
from services.scheduling.domain.views import appointment as appointment_views
from services.scheduling.domain.views.filter_view_enhancer import (
    AppointmentFilterEnum,
    appointment_filter_view_enhancer,
)
from services.scheduling.domain.views.load_view_enhancer import (
    SchedulingLoadEnum,
    scheduling_load_view_enhancer,
)
from services.scheduling.domain.views.page_view_enhancer import (
    appointment_page_view_enhancer,
    internal_appointment_page_view_enhancer,
)
from services.scheduling.service_layer.handlers import (
    ConcurrentUpdateAppointment,
    CooperationCodeNotApplicable,
    InvalidTimeSlot,
    PermissionDenied,
)
from services.scheduling.web_server.dependencies.message_bus import get_message_bus
from services.scheduling.web_server.schemas.appointment import (
    CreateAppointmentByEndUserSchema,
    CreateAppointmentByInternalUserSchema,
    RetrieveAppointmentDetailSchema,
    RetrieveAppointmentSummarySchema,
    UpdateAppointmentByEndUserSchema,
    UpdateAppointmentByInternalUserSchema,
)

router = APIRouter()


@router.get(
    "/organizations/{organization_reference}/appointments",
    tags=["appointment"],
    dependencies=[Depends(internal_user_login_required)],
    response_model=ResponseSchema[
        EnhancedViewSchema[List[RetrieveAppointmentSummarySchema]]
    ],
)
async def get_organization_appointments(
    organization_reference: Reference,
    filter_context=Depends(appointment_filter_view_enhancer.get_context),
    page_context=Depends(internal_appointment_page_view_enhancer.get_context),
    bus: MessageBus = Depends(get_message_bus),
):
    async for enhanced_entities, page_metadata in appointment_views.get_appointments_by_organization_reference_and_filter_and_page(
        bus.uow,
        organization_reference,
        ViewEnhancement(
            enhancer=appointment_filter_view_enhancer,
            context=filter_context,
        ),
        ViewEnhancement(
            enhancer=internal_appointment_page_view_enhancer, context=page_context
        ),
    ):
        return ResponseSchema[
            EnhancedViewSchema[List[RetrieveAppointmentSummarySchema]]
        ](
            status=StatusEnum.SUCCESS,
            data=EnhancedViewSchema(
                enhanced_data=[
                    RetrieveAppointmentSummarySchema.from_orm(entity)
                    for entity in enhanced_entities
                ],
                metadata={"page": page_metadata},
            ),
        )


@router.get(
    "/organizations/{organization_reference}/single_day_appointments",
    tags=["appointment"],
    dependencies=[Depends(internal_user_login_required)],
    response_model=ResponseSchema[List[RetrieveAppointmentSummarySchema]],
)
async def get_organization_single_day_appointments(
    organization_reference: Reference,
    filter_context=Depends(appointment_filter_view_enhancer.get_context),
    bus: MessageBus = Depends(get_message_bus),
):
    async for entities in appointment_views.get_appointments_by_organization_reference_and_filter(
        bus.uow,
        organization_reference,
        ViewEnhancement(
            enhancer=appointment_filter_view_enhancer,
            context=filter_context,
        ),
    ):
        return ResponseSchema[List[RetrieveAppointmentSummarySchema]](
            status=StatusEnum.SUCCESS,
            data=[
                RetrieveAppointmentSummarySchema.from_orm(entity) for entity in entities
            ],
        )


@router.get(
    "/end_users/me/appointments",
    tags=["appointment"],
    dependencies=[Depends(end_user_login_required)],
    response_model=ResponseSchema[
        EnhancedViewSchema[List[RetrieveAppointmentSummarySchema]]
    ],
)
async def get_current_end_user_appointments(
    end_user: CurrentEndUserSchema = Depends(get_current_end_user),
    filter_context=Depends(appointment_filter_view_enhancer.get_context),
    page_context=Depends(appointment_page_view_enhancer.get_context),
    bus: MessageBus = Depends(get_message_bus),
):
    data = await appointment_views.get_appointments_by_load_and_filters_and_page(
        bus.uow,
        ViewEnhancement(
            enhancer=scheduling_load_view_enhancer,
            context=LoadContextSchema(type=SchedulingLoadEnum.APPOINTMENT.value),
        ),
        [
            ViewEnhancement(
                enhancer=appointment_filter_view_enhancer,
                context=FilterContextSchema(
                    type=AppointmentFilterEnum.END_USER_REFERENCE.value,
                    query=end_user.reference,
                ),
            ),
            ViewEnhancement(
                enhancer=appointment_filter_view_enhancer,
                context=filter_context,
            ),
        ],
        ViewEnhancement(enhancer=appointment_page_view_enhancer, context=page_context),
    )
    return ResponseSchema[EnhancedViewSchema[List[RetrieveAppointmentSummarySchema]]](
        status=StatusEnum.SUCCESS, data=data
    )


@router.get(
    "/end_users/me/appointments/{appointment_reference}",
    tags=["appointment"],
    dependencies=[Depends(end_user_login_required)],
    response_model=ResponseSchema[RetrieveAppointmentDetailSchema],
)
async def get_current_end_user_appointment_detail(
    appointment_reference: Reference,
    bus: MessageBus = Depends(get_message_bus),
):
    async for data in appointment_views.get_appointment_by_reference(
        bus.uow, appointment_reference
    ):
        return ResponseSchema[RetrieveAppointmentDetailSchema](
            status=StatusEnum.SUCCESS,
            data=RetrieveAppointmentDetailSchema.from_orm(data),
        )


@router.post(
    "/organizations/{organization_reference}/appointments",
    tags=["appointment"],
    dependencies=[
        Depends(internal_user_login_required),
    ],
    response_model=ResponseSchema,
)
async def create_appointment_by_internal_user(
    organization_reference: Reference,
    payload: CreateAppointmentByInternalUserSchema,
    bus: MessageBus = Depends(get_message_bus),
):
    seconds = int((payload.start_time - datetime.min).total_seconds())
    if seconds % timedelta(minutes=5).total_seconds() != 0:
        raise EsenBadRequestError("Invalid payload")

    web_server_config = get_web_server_config()
    cross_service_api_client = CrossServiceAPIClient(web_server_config.PRODUCT_API_HOST)
    service_product_dict = await cross_service_api_client.get(
        f"/cross_service/service_products/{payload.service_product_reference}"
    )

    if (
        uuid.UUID(service_product_dict["organization_reference"])
        != organization_reference
    ):
        raise EsenBadRequestError("Invalid payload")

    effective_time = service_product_dict["effective_time"]
    expire_time = service_product_dict["expire_time"]
    utc_now = datetime.utcnow()
    if cast_string_to_datetime(effective_time) > utc_now:
        raise EsenBadRequestError("Invalid payload")
    if expire_time is not None:
        if cast_string_to_datetime(expire_time) < utc_now:
            raise EsenBadRequestError("Invalid payload")
    try:
        cmd = command.CreateAppointmentByInternalUser(
            organization_reference=organization_reference,
            service_product_dict=service_product_dict,
            payload=payload,
        )
        await bus.handle(cmd)
    except (InvalidTimeSlot, ConcurrentUpdateAppointment):
        raise EsenBadRequestError("The time slot has been taken.")
    return ResponseSchema(status=StatusEnum.SUCCESS)


@router.post(
    "/end_users/me/appointments",
    tags=["appointment"],
    dependencies=[
        Depends(end_user_login_required),
    ],
    response_model=ResponseSchema,
)
async def create_appointment_by_end_user(
    payload: CreateAppointmentByEndUserSchema,
    end_user: CurrentEndUserSchema = Depends(get_current_end_user),
    bus: MessageBus = Depends(get_message_bus),
):
    seconds = int((payload.start_time - datetime.min).total_seconds())
    if seconds % timedelta(minutes=5).total_seconds() != 0:
        raise EsenBadRequestError("Invalid payload")

    web_server_config = get_web_server_config()
    cross_service_api_client = CrossServiceAPIClient(web_server_config.PRODUCT_API_HOST)
    service_product_dict = await cross_service_api_client.get(
        f"/cross_service/service_products/{payload.service_product_reference}"
    )

    if (
        uuid.UUID(service_product_dict["organization_reference"])
        != payload.organization_reference
    ):
        raise EsenBadRequestError("Invalid payload")

    effective_time = service_product_dict["effective_time"]
    expire_time = service_product_dict["expire_time"]
    utc_now = datetime.utcnow()
    if cast_string_to_datetime(effective_time) > utc_now:
        raise EsenBadRequestError("Invalid payload")
    if expire_time is not None:
        if cast_string_to_datetime(expire_time) < utc_now:
            raise EsenBadRequestError("Invalid payload")
    try:
        cmd = command.CreateAppointmentByEndUser(
            end_user_reference=end_user.reference,
            service_product_dict=service_product_dict,
            payload=payload,
        )
        await bus.handle(cmd)
    except CooperationCodeNotApplicable:
        raise EsenBadRequestError("合作代碼無效或不適用您所選擇的時段，請於主選單聯絡客服。")
    except (InvalidTimeSlot, ConcurrentUpdateAppointment):
        raise EsenBadRequestError("The time slot has been taken.")
    return ResponseSchema(status=StatusEnum.SUCCESS)


@router.patch(
    "/organizations/{organization_reference}/appointments/{appointment_reference}",
    tags=["appointment"],
    dependencies=[
        Depends(internal_user_login_required),
    ],
    response_model=ResponseSchema,
)
async def update_appointment_by_internal_user(
    organization_reference: Reference,
    appointment_reference: Reference,
    payload: UpdateAppointmentByInternalUserSchema,
    bus: MessageBus = Depends(get_message_bus),
):
    seconds = int((payload.start_time - datetime.min).total_seconds())
    if seconds % timedelta(minutes=5).total_seconds() != 0:
        raise EsenBadRequestError("Invalid payload")

    web_server_config = get_web_server_config()
    cross_service_api_client = CrossServiceAPIClient(web_server_config.PRODUCT_API_HOST)
    service_product_dict = await cross_service_api_client.get(
        f"/cross_service/service_products/{payload.service_product_reference}"
    )

    if (
        uuid.UUID(service_product_dict["organization_reference"])
        != organization_reference
    ):
        raise EsenBadRequestError("Invalid payload")

    effective_time = service_product_dict["effective_time"]
    expire_time = service_product_dict["expire_time"]
    utc_now = datetime.utcnow()
    if cast_string_to_datetime(effective_time) > utc_now:
        raise EsenBadRequestError("Invalid payload")
    if expire_time is not None:
        if cast_string_to_datetime(expire_time) < utc_now:
            raise EsenBadRequestError("Invalid payload")
    try:
        cmd = command.RescheduleAppointmentByInternalUser(
            appointment_reference=appointment_reference,
            service_product_dict=service_product_dict,
            payload=payload,
        )
        await bus.handle(cmd)
    except (InvalidTimeSlot, ConcurrentUpdateAppointment):
        raise EsenBadRequestError("The time slot has been taken.")
    return ResponseSchema(status=StatusEnum.SUCCESS)


@router.patch(
    "/end_users/me/appointments/{appointment_reference}",
    tags=["appointment"],
    dependencies=[
        Depends(end_user_login_required),
    ],
    response_model=ResponseSchema,
)
async def update_appointment_by_end_user(
    appointment_reference: Reference,
    payload: UpdateAppointmentByEndUserSchema,
    end_user: CurrentEndUserSchema = Depends(get_current_end_user),
    bus: MessageBus = Depends(get_message_bus),
):
    seconds = int((payload.start_time - datetime.min).total_seconds())
    if seconds % timedelta(minutes=5).total_seconds() != 0:
        raise EsenBadRequestError("Invalid payload")

    web_server_config = get_web_server_config()
    cross_service_api_client = CrossServiceAPIClient(web_server_config.PRODUCT_API_HOST)
    service_product_dict = await cross_service_api_client.get(
        f"/cross_service/service_products/{payload.service_product_reference}"
    )

    if (
        uuid.UUID(service_product_dict["organization_reference"])
        != payload.organization_reference
    ):
        raise EsenBadRequestError("Invalid payload")

    effective_time = service_product_dict["effective_time"]
    expire_time = service_product_dict["expire_time"]
    utc_now = datetime.utcnow()
    if cast_string_to_datetime(effective_time) > utc_now:
        raise EsenBadRequestError("Invalid payload")
    if expire_time is not None:
        if cast_string_to_datetime(expire_time) < utc_now:
            raise EsenBadRequestError("Invalid payload")
    try:
        cmd = command.RescheduleAppointmentByEndUser(
            appointment_reference=appointment_reference,
            end_user_reference=end_user.reference,
            service_product_dict=service_product_dict,
            payload=payload,
        )
        await bus.handle(cmd)
    except CooperationCodeNotApplicable:
        raise EsenBadRequestError("合作代碼無效或不適用您所選擇的時段，請於主選單聯絡客服。")
    except (InvalidTimeSlot, ConcurrentUpdateAppointment):
        raise EsenBadRequestError("The time slot has been taken.")
    return ResponseSchema(status=StatusEnum.SUCCESS)


@router.post(
    "/organizations/{organization_reference}/appointments/{appointment_reference}/cancel",
    tags=["appointment"],
    dependencies=[
        Depends(internal_user_login_required),
    ],
    response_model=ResponseSchema,
)
async def cancel_appointment_by_internal_user(
    organization_reference: Reference,
    appointment_reference: Reference,
    bus: MessageBus = Depends(get_message_bus),
):
    try:
        cmd = command.CancelAppointmentByInternalUser(
            appointment_reference=appointment_reference,
        )
        await bus.handle(cmd)
    except PermissionDenied:
        raise EsenPermissionDeniedError()
    except ConcurrentUpdateAppointment:
        raise EsenBadRequestError(
            "Unable to cancel the appointment now. Please retry again later."
        )
    return ResponseSchema(status=StatusEnum.SUCCESS)


@router.post(
    "/end_users/me/appointments/{appointment_reference}/cancel",
    tags=["appointment"],
    dependencies=[
        Depends(end_user_login_required),
    ],
    response_model=ResponseSchema,
)
async def cancel_appointment_by_end_user(
    appointment_reference: Reference,
    end_user: CurrentEndUserSchema = Depends(get_current_end_user),
    bus: MessageBus = Depends(get_message_bus),
):
    try:
        cmd = command.CancelAppointmentByEndUser(
            end_user_reference=end_user.reference,
            appointment_reference=appointment_reference,
        )
        await bus.handle(cmd)
    except PermissionDenied:
        raise EsenPermissionDeniedError()
    except ConcurrentUpdateAppointment:
        raise EsenBadRequestError(
            "Unable to cancel the appointment now. Please retry again later."
        )
    return ResponseSchema(status=StatusEnum.SUCCESS)
