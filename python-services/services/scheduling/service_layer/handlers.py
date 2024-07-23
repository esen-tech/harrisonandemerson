import uuid
from datetime import datetime, timedelta
from typing import List

from sqlalchemy.orm.exc import StaleDataError

from core.config import get_config as get_core_config
from core.enum import EnvEnum
from modules.airtable.airtable_api_client import AirtableAPIClient
from modules.airtable.config import get_config as get_airtable_config
from modules.airtable.enum import BaseEnum, TableEnum
from modules.cross_service.cross_service_api_agent import CrossServiceAPIClient
from modules.domain.types import (
    DateTime,
    Reference,
    cast_datetime_to_string,
    cast_string_to_datetime,
)
from modules.pubsub.event import EventPublisher
from modules.service_layer.message_bus import MessageBus
from modules.web_server.config import get_config as get_web_server_config
from services.scheduling.domain import command, event
from services.scheduling.domain.models.appointment import Appointment
from services.scheduling.domain.models.internal_user_appointment_time_slot import (
    InternalUserAppointmentTimeSlot,
)
from services.scheduling.domain.models.internal_user_time_slot_inventory import (
    InternalUserTimeSlotInventory,
)
from services.scheduling.domain.models.room_appointment_time_slot import (
    RoomAppointmentTimeSlot,
)
from services.scheduling.domain.models.schedule import Schedule
from services.scheduling.domain.models.schedule_date import ScheduleDate
from services.scheduling.domain.models.schedule_date_schedule_time_slot import (
    ScheduleDateScheduleTimeSlot,
)
from services.scheduling.domain.models.schedule_date_schedule_time_slot_internal_user import (
    ScheduleDateScheduleTimeSlotInternalUser,
)
from services.scheduling.domain.models.schedule_time_slot import ScheduleTimeSlot
from services.scheduling.domain.models.time_slot import TimeSlot
from services.scheduling.service_layer.unit_of_work import SqlAlchemyUnitOfWork


class InternalUserTimeSlotInventoryAlreadyExist(Exception):
    pass


class CooperationCodeNotApplicable(Exception):
    pass


class InvalidTimeSlot(Exception):
    pass


class ConcurrentUpdateAppointment(Exception):
    pass


class PermissionDenied(Exception):
    pass


async def validate_cooperation_code(
    appointment_start_time: DateTime, cooperation_code_code: str
):
    try:
        cooperation_code_dict = await get_cooperation_code_dict(cooperation_code_code)
    except Exception as _e:
        raise CooperationCodeNotApplicable()

    if appointment_start_time >= cast_string_to_datetime(
        cooperation_code_dict["expiration_time"]
    ):
        raise CooperationCodeNotApplicable()


async def get_end_user_dict(end_user_reference: Reference) -> dict:
    web_server_config = get_web_server_config()
    cross_service_api_client = CrossServiceAPIClient(web_server_config.IAM_API_HOST)
    end_user_dict = await cross_service_api_client.get(
        "/cross_service/end_user", params={"end_user_reference": end_user_reference}
    )
    return end_user_dict


async def get_cooperation_code_dict(cooperation_code_code: str) -> dict:
    web_server_config = get_web_server_config()
    cross_service_api_client = CrossServiceAPIClient(
        web_server_config.MARKETING_API_HOST
    )
    cooperation_code_dict = await cross_service_api_client.get(
        f"/cross_service/cooperation_codes/{cooperation_code_code}"
    )
    return cooperation_code_dict


async def create_schedule_by_internal_user(
    cmd: command.CreateSchedulByInternalUser,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    async with uow:
        schedule_dates = [
            ScheduleDate(reference=uuid.uuid4(), date=sd.date)
            for sd in cmd.payload.schedule_dates
        ]
        schedule_time_slots = [
            ScheduleTimeSlot(
                reference=uuid.uuid4(),
                name=sts.name,
                start_time=sts.start_time,
                end_time=sts.end_time,
                weekday_indices=sts.weekday_indices,
            )
            for sts in cmd.payload.schedule_time_slots
        ]
        schedule_date_schedule_time_slots = [
            ScheduleDateScheduleTimeSlot(
                schedule_date_reference=schedule_dates[
                    sdsts.schedule_date_index
                ].reference,
                schedule_time_slot_reference=schedule_time_slots[
                    sdsts.schedule_time_slot_index
                ].reference,
                override_schedule_time_slot_start_time=sdsts.override_schedule_time_slot_start_time,
                override_schedule_time_slot_end_time=sdsts.override_schedule_time_slot_end_time,
                schedule_date_schedule_time_slot_internal_users=[
                    ScheduleDateScheduleTimeSlotInternalUser(
                        internal_user_reference=sdstsiu.internal_user_reference
                    )
                    for sdstsiu in sdsts.schedule_date_schedule_time_slot_internal_users
                ],
            )
            for sdsts in cmd.payload.schedule_date_schedule_time_slots
        ]
        schedule = Schedule(
            organization_reference=cmd.organization_reference,
            name=cmd.payload.name,
            min_date=min(schedule_dates, key=lambda d: d.date).date,
            max_date=max(schedule_dates, key=lambda d: d.date).date,
            timezone_offset_in_minutes=cmd.payload.timezone_offset_in_minutes,
            schedule_dates=schedule_dates,
            schedule_time_slots=schedule_time_slots,
            schedule_date_schedule_time_slots=schedule_date_schedule_time_slots,
        )
        await uow.schedule_repository.add(schedule)
        await uow.commit()


async def update_schedule_by_internal_user(
    cmd: command.UpdateScheduleByInternalUser,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    async with uow:
        schedule = await uow.schedule_repository.get_by_reference(
            cmd.schedule_reference
        )
        schedule_dates = sorted(schedule.schedule_dates, key=lambda sd: sd.date)
        schedule_time_slots = sorted(
            schedule.schedule_time_slots, key=lambda sts: sts.start_time
        )
        schedule.schedule_date_schedule_time_slots = [
            ScheduleDateScheduleTimeSlot(
                schedule_date_reference=schedule_dates[
                    sdsts.schedule_date_index
                ].reference,
                schedule_time_slot_reference=schedule_time_slots[
                    sdsts.schedule_time_slot_index
                ].reference,
                override_schedule_time_slot_start_time=sdsts.override_schedule_time_slot_start_time,
                override_schedule_time_slot_end_time=sdsts.override_schedule_time_slot_end_time,
                schedule_date_schedule_time_slot_internal_users=[
                    ScheduleDateScheduleTimeSlotInternalUser(
                        internal_user_reference=sdstsiu.internal_user_reference
                    )
                    for sdstsiu in sdsts.schedule_date_schedule_time_slot_internal_users
                ],
            )
            for sdsts in cmd.payload.schedule_date_schedule_time_slots
        ]
        await uow.commit()


async def publish_schedule_by_internal_user(
    cmd: command.PublishScheduleByInternalUser,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    async with uow:
        schedule = await uow.schedule_repository.get_by_reference(
            cmd.schedule_reference
        )
        schedule_date_reference_map = {
            sd.reference: sd for sd in schedule.schedule_dates
        }
        schedule_time_slot_reference_map = {
            sts.reference: sts for sts in schedule.schedule_time_slots
        }

        # update properties of schedule
        schedule.last_publish_time = datetime.utcnow()

        # update inventories
        start_time = datetime(
            schedule.min_date.year,
            schedule.min_date.month,
            schedule.min_date.day,
        ) + timedelta(minutes=schedule.timezone_offset_in_minutes)
        end_time = datetime(
            schedule.max_date.year,
            schedule.max_date.month,
            schedule.max_date.day,
        ) + timedelta(days=1, minutes=schedule.timezone_offset_in_minutes)

        internal_user_time_slot_inventories = (
            await uow.internal_user_time_slot_inventory_repository.get_all_by(
                start_time <= InternalUserTimeSlotInventory._time_slot_start_time,
                InternalUserTimeSlotInventory._time_slot_end_time <= end_time,
                organization_reference=schedule.organization_reference,
            )
        )
        for iutsi in internal_user_time_slot_inventories:
            iutsi.deduct(iutsi.total_inventory)
        internal_user_time_slot_inventory_map = {
            iutsi.time_slot: iutsi for iutsi in internal_user_time_slot_inventories
        }
        for sdsts in schedule.schedule_date_schedule_time_slots:
            schedule_date = schedule_date_reference_map[sdsts.schedule_date_reference]
            schedule_time_slot = schedule_time_slot_reference_map[
                sdsts.schedule_time_slot_reference
            ]
            referenced_start_time = (
                sdsts.override_schedule_time_slot_start_time
                or schedule_time_slot.start_time
            )
            referenced_end_time = (
                sdsts.override_schedule_time_slot_end_time
                or schedule_time_slot.end_time
            )
            spread_time_slot = TimeSlot(
                start_time=datetime(
                    schedule_date.date.year,
                    schedule_date.date.month,
                    schedule_date.date.day,
                    referenced_start_time.hour,
                    referenced_start_time.minute,
                    referenced_start_time.second,
                )
                + timedelta(minutes=schedule.timezone_offset_in_minutes),
                end_time=datetime(
                    schedule_date.date.year,
                    schedule_date.date.month,
                    schedule_date.date.day,
                    referenced_end_time.hour,
                    referenced_end_time.minute,
                    referenced_end_time.second,
                )
                + timedelta(minutes=schedule.timezone_offset_in_minutes),
            )
            current_start_time = spread_time_slot.start_time
            while current_start_time < spread_time_slot.end_time:
                end_time = current_start_time + timedelta(minutes=5)
                current_time_slot = TimeSlot(
                    start_time=current_start_time, end_time=end_time
                )
                internal_user_reference = next(
                    (
                        sdstsiu.internal_user_reference
                        for sdstsiu in sdsts.schedule_date_schedule_time_slot_internal_users
                    ),
                    None,
                )
                if internal_user_reference is None:
                    if current_time_slot in internal_user_time_slot_inventory_map:
                        await uow.internal_user_time_slot_inventory_repository.delete(
                            internal_user_time_slot_inventory_map[current_time_slot]
                        )
                    current_start_time = end_time
                    continue

                if current_time_slot in internal_user_time_slot_inventory_map:
                    internal_user_time_slot_inventory = (
                        internal_user_time_slot_inventory_map[current_time_slot]
                    )
                    internal_user_time_slot_inventory.internal_user_reference = (
                        internal_user_reference
                    )
                else:
                    internal_user_time_slot_inventory = InternalUserTimeSlotInventory(
                        organization_reference=schedule.organization_reference,
                        internal_user_reference=internal_user_reference,
                    )
                    internal_user_time_slot_inventory.time_slot = current_time_slot
                    await uow.internal_user_time_slot_inventory_repository.add(
                        internal_user_time_slot_inventory
                    )
                internal_user_time_slot_inventory.warehouse(inventory_count=1)
                current_start_time = end_time

        await uow.commit()


async def create_appointment_by_internal_user(
    cmd: command.CreateAppointmentByInternalUser,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    end_time = cmd.payload.start_time + timedelta(
        minutes=cmd.service_product_dict["duration_in_time_slots"] * 5
    )
    spread_time_slot = TimeSlot(start_time=cmd.payload.start_time, end_time=end_time)

    async with uow:
        internal_user_time_slot_inventories = await uow.internal_user_time_slot_inventory_repository.get_all_available_by_organization_reference_and_spread_time_slot_and_internal_user_references(
            organization_reference=cmd.organization_reference,
            spread_time_slot=spread_time_slot,
            internal_user_references=cmd.payload.internal_user_references,
        )
        if (
            len(internal_user_time_slot_inventories)
            != cmd.service_product_dict["duration_in_time_slots"]
        ):
            raise InvalidTimeSlot("Unable to process time slot")

        internal_user_appointment_time_slots: List[InternalUserAppointmentTimeSlot] = []
        room_appointment_time_slots: List[RoomAppointmentTimeSlot] = []

        for iutsi in internal_user_time_slot_inventories:
            inventory_count = 1
            iutsi.allocate(inventory_count)
            internal_user_appointment_time_slot = InternalUserAppointmentTimeSlot(
                internal_user_time_slot_inventory_reference=iutsi.reference,
                internal_user_reference=iutsi.internal_user_reference,
                allocated_inventory=inventory_count,
            )
            internal_user_appointment_time_slot.time_slot = iutsi.time_slot
            internal_user_appointment_time_slots.append(
                internal_user_appointment_time_slot
            )

        appointment = Appointment(
            reference=cmd.payload.reference,
            organization_reference=cmd.organization_reference,
            service_product_reference=cmd.payload.service_product_reference,
            end_user_reference=cmd.payload.end_user_reference,
            state=Appointment.StateEnum.SCHEDULED.value,
            internal_user_appointment_time_slots=internal_user_appointment_time_slots,
            room_appointment_time_slots=room_appointment_time_slots,
        )
        appointment.evaluated_time_slot = spread_time_slot
        await uow.appointment_repository.add(appointment)
        try:
            await uow.commit()
        except StaleDataError as e:
            raise ConcurrentUpdateAppointment(e)

        bus.push_event(
            event.AppointmentCreated(appointment_reference=cmd.payload.reference)
        )


async def create_appointment_by_end_user(
    cmd: command.CreateAppointmentByEndUser,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    end_time = cmd.payload.start_time + timedelta(
        minutes=cmd.service_product_dict["duration_in_time_slots"] * 5
    )
    spread_time_slot = TimeSlot(start_time=cmd.payload.start_time, end_time=end_time)

    if cmd.payload.cooperation_code_code is not None:
        await validate_cooperation_code(
            cmd.payload.start_time, cmd.payload.cooperation_code_code
        )

    async with uow:
        internal_user_time_slot_inventories = await uow.internal_user_time_slot_inventory_repository.get_all_available_by_organization_reference_and_spread_time_slot_and_internal_user_references(
            organization_reference=cmd.payload.organization_reference,
            spread_time_slot=spread_time_slot,
            internal_user_references=cmd.payload.internal_user_references,
        )
        if (
            len(internal_user_time_slot_inventories)
            != cmd.service_product_dict["duration_in_time_slots"]
        ):
            raise InvalidTimeSlot("Unable to process time slot")

        internal_user_appointment_time_slots: List[InternalUserAppointmentTimeSlot] = []
        room_appointment_time_slots: List[RoomAppointmentTimeSlot] = []

        for iutsi in internal_user_time_slot_inventories:
            inventory_count = 1
            iutsi.allocate(inventory_count)
            internal_user_appointment_time_slot = InternalUserAppointmentTimeSlot(
                internal_user_time_slot_inventory_reference=iutsi.reference,
                internal_user_reference=iutsi.internal_user_reference,
                allocated_inventory=inventory_count,
            )
            internal_user_appointment_time_slot.time_slot = iutsi.time_slot
            internal_user_appointment_time_slots.append(
                internal_user_appointment_time_slot
            )

        appointment = Appointment(
            reference=cmd.payload.reference,
            organization_reference=cmd.payload.organization_reference,
            service_product_reference=cmd.payload.service_product_reference,
            end_user_reference=cmd.end_user_reference,
            principal_name=cmd.payload.principal_name,
            principal_phone_number=cmd.payload.principal_phone_number,
            state=Appointment.StateEnum.SCHEDULED.value,
            cooperation_code_code=cmd.payload.cooperation_code_code,
            internal_user_appointment_time_slots=internal_user_appointment_time_slots,
            room_appointment_time_slots=room_appointment_time_slots,
        )
        appointment.evaluated_time_slot = spread_time_slot
        await uow.appointment_repository.add(appointment)
        try:
            await uow.commit()
        except StaleDataError as e:
            raise ConcurrentUpdateAppointment(e)

        bus.push_event(
            event.AppointmentCreated(appointment_reference=cmd.payload.reference)
        )


async def reschedule_appointment_by_internal_user(
    cmd: command.RescheduleAppointmentByInternalUser,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    end_time = cmd.payload.start_time + timedelta(
        minutes=cmd.service_product_dict["duration_in_time_slots"] * 5
    )
    spread_time_slot = TimeSlot(start_time=cmd.payload.start_time, end_time=end_time)

    async with uow:
        appointment = await uow.appointment_repository.get_by_reference(
            cmd.appointment_reference
        )

        # Deallocation Phase

        internal_user_time_slot_inventories = await uow.internal_user_time_slot_inventory_repository.get_all_by_references(
            [
                iuats.internal_user_time_slot_inventory_reference
                for iuats in appointment.internal_user_appointment_time_slots
            ]
        )
        internal_user_time_slot_inventory_map = {
            iutsi.reference: iutsi for iutsi in internal_user_time_slot_inventories
        }

        for iuats in appointment.internal_user_appointment_time_slots:
            internal_user_time_slot_inventory = internal_user_time_slot_inventory_map[
                iuats.internal_user_time_slot_inventory_reference
            ]
            internal_user_time_slot_inventory.deallocate(iuats.allocated_inventory)

        # Allocation Phase

        internal_user_time_slot_inventories = await uow.internal_user_time_slot_inventory_repository.get_all_available_by_organization_reference_and_spread_time_slot_and_internal_user_references(
            organization_reference=appointment.organization_reference,
            spread_time_slot=spread_time_slot,
            internal_user_references=cmd.payload.internal_user_references,
        )
        if (
            len(internal_user_time_slot_inventories)
            != cmd.service_product_dict["duration_in_time_slots"]
        ):
            raise InvalidTimeSlot("Unable to process time slot")

        internal_user_appointment_time_slots: List[InternalUserAppointmentTimeSlot] = []
        room_appointment_time_slots: List[RoomAppointmentTimeSlot] = []

        for iutsi in internal_user_time_slot_inventories:
            inventory_count = 1
            iutsi.allocate(inventory_count)
            internal_user_appointment_time_slot = InternalUserAppointmentTimeSlot(
                appointment_reference=cmd.appointment_reference,
                internal_user_time_slot_inventory_reference=iutsi.reference,
                internal_user_reference=iutsi.internal_user_reference,
                allocated_inventory=inventory_count,
            )
            internal_user_appointment_time_slot.time_slot = iutsi.time_slot
            internal_user_appointment_time_slots.append(
                internal_user_appointment_time_slot
            )
        appointment.internal_user_appointment_time_slots = (
            internal_user_appointment_time_slots
        )
        appointment.room_appointment_time_slots = room_appointment_time_slots

        # Update Appointment Phase

        appointment.end_user_reference = cmd.payload.end_user_reference
        appointment.service_product_reference = cmd.payload.service_product_reference
        appointment.evaluated_time_slot = spread_time_slot

        try:
            await uow.commit()
        except StaleDataError as e:
            raise ConcurrentUpdateAppointment(e)

        bus.push_event(
            event.AppointmentRescheduled(
                appointment_reference=cmd.appointment_reference
            )
        )


async def reschedule_appointment_by_end_user(
    cmd: command.RescheduleAppointmentByEndUser,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    end_time = cmd.payload.start_time + timedelta(
        minutes=cmd.service_product_dict["duration_in_time_slots"] * 5
    )
    spread_time_slot = TimeSlot(start_time=cmd.payload.start_time, end_time=end_time)

    if cmd.payload.cooperation_code_code is not None:
        await validate_cooperation_code(
            cmd.payload.start_time, cmd.payload.cooperation_code_code
        )

    async with uow:
        appointment = await uow.appointment_repository.get_by_reference(
            cmd.appointment_reference
        )
        if cmd.end_user_reference != appointment.end_user_reference:
            raise PermissionDenied()

        # Deallocation Phase

        internal_user_time_slot_inventories = await uow.internal_user_time_slot_inventory_repository.get_all_by_references(
            [
                iuats.internal_user_time_slot_inventory_reference
                for iuats in appointment.internal_user_appointment_time_slots
            ]
        )
        internal_user_time_slot_inventory_map = {
            iutsi.reference: iutsi for iutsi in internal_user_time_slot_inventories
        }

        for iuats in appointment.internal_user_appointment_time_slots:
            internal_user_time_slot_inventory = internal_user_time_slot_inventory_map[
                iuats.internal_user_time_slot_inventory_reference
            ]
            internal_user_time_slot_inventory.deallocate(iuats.allocated_inventory)

        # Allocation Phase

        internal_user_time_slot_inventories = await uow.internal_user_time_slot_inventory_repository.get_all_available_by_organization_reference_and_spread_time_slot_and_internal_user_references(
            organization_reference=appointment.organization_reference,
            spread_time_slot=spread_time_slot,
            internal_user_references=cmd.payload.internal_user_references,
        )
        if (
            len(internal_user_time_slot_inventories)
            != cmd.service_product_dict["duration_in_time_slots"]
        ):
            raise InvalidTimeSlot("Unable to process time slot")

        internal_user_appointment_time_slots: List[InternalUserAppointmentTimeSlot] = []
        room_appointment_time_slots: List[RoomAppointmentTimeSlot] = []

        for iutsi in internal_user_time_slot_inventories:
            inventory_count = 1
            iutsi.allocate(inventory_count)
            internal_user_appointment_time_slot = InternalUserAppointmentTimeSlot(
                appointment_reference=cmd.appointment_reference,
                internal_user_time_slot_inventory_reference=iutsi.reference,
                internal_user_reference=iutsi.internal_user_reference,
                allocated_inventory=inventory_count,
            )
            internal_user_appointment_time_slot.time_slot = iutsi.time_slot
            internal_user_appointment_time_slots.append(
                internal_user_appointment_time_slot
            )
        appointment.internal_user_appointment_time_slots = (
            internal_user_appointment_time_slots
        )
        appointment.room_appointment_time_slots = room_appointment_time_slots

        # Update Appointment Phase

        appointment.principal_name = cmd.payload.principal_name
        appointment.principal_phone_number = cmd.payload.principal_phone_number
        appointment.service_product_reference = cmd.payload.service_product_reference
        appointment.cooperation_code_code = cmd.payload.cooperation_code_code
        appointment.evaluated_time_slot = spread_time_slot

        try:
            await uow.commit()
        except StaleDataError as e:
            raise ConcurrentUpdateAppointment(e)

        bus.push_event(
            event.AppointmentRescheduled(
                appointment_reference=cmd.appointment_reference
            )
        )


async def cancel_appointment_by_internal_user(
    command: command.CancelAppointmentByInternalUser,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    async with uow:
        appointment = await uow.appointment_repository.get_by_reference(
            command.appointment_reference
        )
        internal_user_time_slot_inventories = await uow.internal_user_time_slot_inventory_repository.get_all_by_references(
            [
                iuats.internal_user_time_slot_inventory_reference
                for iuats in appointment.internal_user_appointment_time_slots
            ]
        )
        internal_user_time_slot_inventory_map = {
            iutsi.reference: iutsi for iutsi in internal_user_time_slot_inventories
        }

        for iuats in appointment.internal_user_appointment_time_slots:
            internal_user_time_slot_inventory = internal_user_time_slot_inventory_map[
                iuats.internal_user_time_slot_inventory_reference
            ]
            internal_user_time_slot_inventory.deallocate(iuats.allocated_inventory)

        appointment.cancel()
        try:
            await uow.commit()
        except StaleDataError as e:
            raise ConcurrentUpdateAppointment(e)

        bus.push_event(
            event.AppointmentCancelled(
                appointment_reference=command.appointment_reference
            )
        )


async def cancel_appointment_by_end_user(
    command: command.CancelAppointmentByEndUser,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    async with uow:
        appointment = await uow.appointment_repository.get_by_reference(
            command.appointment_reference
        )
        if command.end_user_reference != appointment.end_user_reference:
            raise PermissionDenied()

        internal_user_time_slot_inventories = await uow.internal_user_time_slot_inventory_repository.get_all_by_references(
            [
                iuats.internal_user_time_slot_inventory_reference
                for iuats in appointment.internal_user_appointment_time_slots
            ]
        )
        internal_user_time_slot_inventory_map = {
            iutsi.reference: iutsi for iutsi in internal_user_time_slot_inventories
        }

        for iuats in appointment.internal_user_appointment_time_slots:
            internal_user_time_slot_inventory = internal_user_time_slot_inventory_map[
                iuats.internal_user_time_slot_inventory_reference
            ]
            internal_user_time_slot_inventory.deallocate(iuats.allocated_inventory)

        appointment.cancel()
        try:
            await uow.commit()
        except StaleDataError as e:
            raise ConcurrentUpdateAppointment(e)

        bus.push_event(
            event.AppointmentCancelled(
                appointment_reference=command.appointment_reference
            )
        )


async def create_airtable_visit(
    e: event.AppointmentCreated,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    core_config = get_core_config()
    if core_config.ENV != EnvEnum.PRODUCTION:
        return

    web_server_config = get_web_server_config()
    airtable_config = get_airtable_config()
    product_service_api_client = CrossServiceAPIClient(
        web_server_config.PRODUCT_API_HOST
    )
    airtable_api_client = AirtableAPIClient(airtable_config.AIRTABLE_API_KEY_EDITOR)

    async with uow:
        appointment = await uow.appointment_repository.get_by_reference(
            e.appointment_reference
        )
        end_user_dict = await get_end_user_dict(appointment.end_user_reference)
        service_product_dict = await product_service_api_client.get(
            f"/cross_service/service_products/{appointment.service_product_reference}"
        )
        airtable_visit_dict = {
            "日期 Date": cast_datetime_to_string(
                appointment.evaluated_time_slot.start_time
            ),
            "姓名 Name": [end_user_dict["airtable_reference"]],
            "（代理預約）就診人姓名": appointment.principal_name,
            "（代理預約）就診人聯絡電話": appointment.principal_phone_number,
            "門診類別": service_product_dict["display_sku_key"],
            "就診狀態": "就醫預約",
        }
        if appointment.cooperation_code_code is not None:
            cooperation_code_dict = await get_cooperation_code_dict(
                appointment.cooperation_code_code
            )
            airtable_visit_dict.update(
                {
                    "營運須知": cooperation_code_dict["operation_remark"],
                    "公司/KOL名稱/活動名稱": cooperation_code_dict["entity_name"],
                }
            )
        airtable_visit = await airtable_api_client.create_record(
            BaseEnum.ESEN_CLINIC, TableEnum.VISIT, airtable_visit_dict, typecast=True
        )
        appointment.airtable_reference = airtable_visit["id"]
        await uow.commit()


async def reschedule_airtable_visit(
    e: event.AppointmentRescheduled,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    core_config = get_core_config()
    if core_config.ENV != EnvEnum.PRODUCTION:
        return

    web_server_config = get_web_server_config()
    airtable_config = get_airtable_config()
    iam_service_api_client = CrossServiceAPIClient(web_server_config.IAM_API_HOST)
    product_service_api_client = CrossServiceAPIClient(
        web_server_config.PRODUCT_API_HOST
    )
    airtable_api_client = AirtableAPIClient(airtable_config.AIRTABLE_API_KEY_EDITOR)
    async with uow:
        appointment = await uow.appointment_repository.get_by_reference(
            e.appointment_reference
        )
        end_user_dict = await iam_service_api_client.get(
            "/cross_service/end_user",
            params={"end_user_reference": appointment.end_user_reference},
        )
        service_product_dict = await product_service_api_client.get(
            f"/cross_service/service_products/{appointment.service_product_reference}"
        )
        airtable_visit_dict = {
            "姓名 Name": end_user_dict["airtable_reference"],
            "（代理預約）就診人姓名": appointment.principal_name,
            "（代理預約）就診人聯絡電話": appointment.principal_phone_number,
            "日期 Date": cast_datetime_to_string(
                appointment.evaluated_time_slot.start_time
            ),
            "門診類別": service_product_dict["display_sku_key"],
            "就診狀態": "就醫預約",
        }
        if appointment.cooperation_code_code is not None:
            cooperation_code_dict = await get_cooperation_code_dict(
                appointment.cooperation_code_code
            )
            airtable_visit_dict.update(
                {
                    "營運須知": cooperation_code_dict["operation_remark"],
                    "公司/KOL名稱/活動名稱": cooperation_code_dict["entity_name"],
                }
            )
        else:
            airtable_visit_dict.update({"營運須知": "", "公司/KOL名稱/活動名稱": ""})
        await airtable_api_client.update_record_by_id(
            BaseEnum.ESEN_CLINIC,
            TableEnum.VISIT,
            appointment.airtable_reference,
            airtable_visit_dict,
            typecast=True,
        )


async def cancel_airtable_visit(
    event: event.AppointmentCancelled,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    core_config = get_core_config()
    if core_config.ENV != EnvEnum.PRODUCTION:
        return

    airtable_config = get_airtable_config()
    airtable_api_client = AirtableAPIClient(airtable_config.AIRTABLE_API_KEY_EDITOR)
    async with uow:
        appointment = await uow.appointment_repository.get_by_reference(
            event.appointment_reference
        )
        await airtable_api_client.update_record_by_id(
            BaseEnum.ESEN_CLINIC,
            TableEnum.VISIT,
            appointment.airtable_reference,
            {"就診狀態": "取消預約"},
        )


async def replace_airtable_schedules(
    event: event.AirtableSchedulesUpdated,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    airtable_config = get_airtable_config()
    airtable_api_client = AirtableAPIClient(airtable_config.AIRTABLE_API_KEY)
    airtable_schedules = await airtable_api_client.get_all_records(
        BaseEnum.ESEN_CLINIC,
        TableEnum.SCHEDULE,
        fields=["Staff", "Start", "End"],
        filter_by_formula=f"{{Status}}='Open'",
    )
    async with uow:
        internal_user_time_slot_inventories = (
            await uow.internal_user_time_slot_inventory_repository.get_all_by()
        )

        for iutsi in internal_user_time_slot_inventories:
            iutsi.deduct(iutsi.total_inventory)

        internal_user_time_slot_inventory_map = {
            iutsi.time_slot: iutsi for iutsi in internal_user_time_slot_inventories
        }
        for airtable_schedule in airtable_schedules:
            spread_time_slot = TimeSlot(
                start_time=cast_string_to_datetime(
                    airtable_schedule["fields"]["Start"]
                ),
                end_time=cast_string_to_datetime(airtable_schedule["fields"]["End"]),
            )
            current_start_time = spread_time_slot.start_time
            while current_start_time < spread_time_slot.end_time:
                end_time = current_start_time + timedelta(minutes=5)
                current_time_slot = TimeSlot(
                    start_time=current_start_time, end_time=end_time
                )
                if current_time_slot in internal_user_time_slot_inventory_map:
                    internal_user_time_slot_inventory = (
                        internal_user_time_slot_inventory_map[current_time_slot]
                    )
                    internal_user_time_slot_inventory.internal_user_reference = airtable_config.AIRTABLE_STAFF_RECORD_ID_TO_INTERNAL_USER_REFERENCE_MAP[
                        airtable_schedule["fields"]["Staff"][0]
                    ]
                else:
                    internal_user_time_slot_inventory = InternalUserTimeSlotInventory(
                        organization_reference=airtable_config.ESEN_CLINIC_ORGANIZATION_REFERENCE,
                        internal_user_reference=airtable_config.AIRTABLE_STAFF_RECORD_ID_TO_INTERNAL_USER_REFERENCE_MAP[
                            airtable_schedule["fields"]["Staff"][0]
                        ],
                    )
                    internal_user_time_slot_inventory.time_slot = current_time_slot
                    await uow.internal_user_time_slot_inventory_repository.add(
                        internal_user_time_slot_inventory
                    )
                internal_user_time_slot_inventory.warehouse(inventory_count=1)

                current_start_time = end_time

        await uow.commit()


async def pull_airtable_visit(
    event: event.AirtableVisitUpserted,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    web_server_config = get_web_server_config()
    airtable_config = get_airtable_config()
    airtable_api_client = AirtableAPIClient(airtable_config.AIRTABLE_API_KEY)
    airtable_visit = await airtable_api_client.get_record_by_id(
        BaseEnum.ESEN_CLINIC, TableEnum.VISIT, event.airtable_reference
    )
    async with uow:
        appointment = await uow.appointment_repository.get_by(
            airtable_reference=event.airtable_reference
        )
        if appointment is None:
            # create local appointment

            iam_service_api_client = CrossServiceAPIClient(
                web_server_config.IAM_API_HOST
            )
            product_service_api_client = CrossServiceAPIClient(
                web_server_config.PRODUCT_API_HOST
            )
            end_user_dict = await iam_service_api_client.get(
                "/cross_service/end_user",
                params={
                    "airtable_reference": next(
                        airtable_ref
                        for airtable_ref in airtable_visit["fields"]["姓名 Name"]
                    )
                },
            )
            service_product_reference = (
                airtable_config.AIRTABLE_VISIT_門診類別_TO_SERVICE_PRODUCT_REFERENCE_MAP[
                    airtable_visit["fields"]["門診類別"]
                ]
            )
            service_product_dict = await product_service_api_client.get(
                f"/cross_service/service_products/{service_product_reference}"
            )
            start_time = cast_string_to_datetime(airtable_visit["fields"]["日期 Date"])
            end_time = start_time + timedelta(
                minutes=service_product_dict["duration_in_time_slots"] * 5
            )
            spread_time_slot = TimeSlot(start_time=start_time, end_time=end_time)

            internal_user_time_slot_inventories = await uow.internal_user_time_slot_inventory_repository.get_all_available_by_organization_reference_and_spread_time_slot_and_internal_user_references(
                organization_reference=airtable_config.ESEN_CLINIC_ORGANIZATION_REFERENCE,
                spread_time_slot=spread_time_slot,
                internal_user_references=[
                    spiu_dict["internal_user_reference"]
                    for spiu_dict in service_product_dict[
                        "service_product_internal_users"
                    ]
                ],
            )
            if (
                len(internal_user_time_slot_inventories)
                != service_product_dict["duration_in_time_slots"]
            ):
                raise InvalidTimeSlot("Unable to process time slot")

            internal_user_appointment_time_slots: List[
                InternalUserAppointmentTimeSlot
            ] = []
            room_appointment_time_slots: List[RoomAppointmentTimeSlot] = []

            for iutsi in internal_user_time_slot_inventories:
                inventory_count = 1
                iutsi.allocate(inventory_count)
                internal_user_appointment_time_slot = InternalUserAppointmentTimeSlot(
                    internal_user_time_slot_inventory_reference=iutsi.reference,
                    internal_user_reference=iutsi.internal_user_reference,
                    allocated_inventory=inventory_count,
                )
                internal_user_appointment_time_slot.time_slot = iutsi.time_slot
                internal_user_appointment_time_slots.append(
                    internal_user_appointment_time_slot
                )

            appointment = Appointment(
                airtable_reference=airtable_visit["id"],
                organization_reference=airtable_config.ESEN_CLINIC_ORGANIZATION_REFERENCE,
                service_product_reference=service_product_reference,
                end_user_reference=end_user_dict["reference"],
                state=None,
                internal_user_appointment_time_slots=internal_user_appointment_time_slots,
                room_appointment_time_slots=room_appointment_time_slots,
            )
            appointment.evaluated_time_slot = spread_time_slot
            await uow.appointment_repository.add(appointment)

        # update local appointment

        if airtable_visit["fields"]["就診狀態"] in (
            "就醫預約",
            "已到診",
            "看診中",
            "診後衛教",
            "非就醫預約",
            "執行中",
        ):
            appointment.schedule()
        elif airtable_visit["fields"]["就診狀態"] in ("就診結束", "執行結束"):
            appointment.complete()
        elif airtable_visit["fields"]["就診狀態"] in ("無故缺席"):
            appointment.absent()
        elif airtable_visit["fields"]["就診狀態"] in ("取消預約"):
            internal_user_time_slot_inventories = await uow.internal_user_time_slot_inventory_repository.get_all_by_references(
                [
                    iuats.internal_user_time_slot_inventory_reference
                    for iuats in appointment.internal_user_appointment_time_slots
                ]
            )
            internal_user_time_slot_inventory_map = {
                iutsi.reference: iutsi for iutsi in internal_user_time_slot_inventories
            }
            for iuats in appointment.internal_user_appointment_time_slots:
                internal_user_time_slot_inventory = (
                    internal_user_time_slot_inventory_map[
                        iuats.internal_user_time_slot_inventory_reference
                    ]
                )
                internal_user_time_slot_inventory.deallocate(iuats.allocated_inventory)
            appointment.cancel()

        await uow.commit()


command_handler_map = {
    command.CreateSchedulByInternalUser: create_schedule_by_internal_user,
    command.UpdateScheduleByInternalUser: update_schedule_by_internal_user,
    command.PublishScheduleByInternalUser: publish_schedule_by_internal_user,
    command.CreateAppointmentByInternalUser: create_appointment_by_internal_user,
    command.CreateAppointmentByEndUser: create_appointment_by_end_user,
    command.RescheduleAppointmentByInternalUser: reschedule_appointment_by_internal_user,
    command.RescheduleAppointmentByEndUser: reschedule_appointment_by_end_user,
    command.CancelAppointmentByInternalUser: cancel_appointment_by_internal_user,
    command.CancelAppointmentByEndUser: cancel_appointment_by_end_user,
}

event_handlers_map = {
    event.AppointmentCreated: [create_airtable_visit],
    event.AppointmentRescheduled: [reschedule_airtable_visit],
    event.AppointmentCancelled: [cancel_airtable_visit],
    event.AirtableSchedulesUpdated: [replace_airtable_schedules],
    event.AirtableVisitUpserted: [pull_airtable_visit],
}
