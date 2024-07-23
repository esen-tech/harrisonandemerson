from typing import List

from modules.domain.types import Date, DateTime, Reference, Time
from modules.web_server.schemas.base import (
    BaseCreateEntitySchema,
    BaseRetrieveEntitySchema,
    BaseUpdateEntitySchema,
)


class CreateSchedulByInternalUserSchema(BaseCreateEntitySchema):
    class _CreateScheduleDateSchema(BaseCreateEntitySchema):
        date: Date

    class _CreateScheduleTimeSlotSchema(BaseCreateEntitySchema):
        name: str
        start_time: Time
        end_time: Time
        weekday_indices: str

    class _CreateScheduleDateScheduleTimeSlotSchema(BaseCreateEntitySchema):
        class _CreateScheduleDateScheduleTimeSlotInternalUserSchema(
            BaseCreateEntitySchema
        ):
            internal_user_reference: Reference

        schedule_date_index: int
        schedule_time_slot_index: int
        override_schedule_time_slot_start_time: Time | None = None
        override_schedule_time_slot_end_time: Time | None = None
        schedule_date_schedule_time_slot_internal_users: List[
            _CreateScheduleDateScheduleTimeSlotInternalUserSchema
        ]

    name: str
    timezone_offset_in_minutes: int
    schedule_dates: List[_CreateScheduleDateSchema]
    schedule_time_slots: List[_CreateScheduleTimeSlotSchema]
    schedule_date_schedule_time_slots: List[_CreateScheduleDateScheduleTimeSlotSchema]


class RetrieveScheduleSummarySchema(BaseRetrieveEntitySchema):
    name: str
    min_date: Date
    max_date: Date
    last_publish_time: DateTime | None


class RetrieveScheduleDetailSchema(RetrieveScheduleSummarySchema):
    class _RetrieveScheduleDateSchema(BaseRetrieveEntitySchema):
        date: Date

    class _RetrieveScheduleTimeSlotSchema(BaseRetrieveEntitySchema):
        name: str
        start_time: Time
        end_time: Time
        weekday_indices: str

    class _RetrieveScheduleDateScheduleTimeSlotSchema(BaseRetrieveEntitySchema):
        class _RetrieveScheduleDateScheduleTimeSlotInternalUserSchema(
            BaseRetrieveEntitySchema
        ):
            internal_user_reference: Reference

        schedule_date_reference: Reference
        schedule_time_slot_reference: Reference
        override_schedule_time_slot_start_time: Time | None = None
        override_schedule_time_slot_end_time: Time | None = None
        schedule_date_schedule_time_slot_internal_users: List[
            _RetrieveScheduleDateScheduleTimeSlotInternalUserSchema
        ]

    timezone_offset_in_minutes: int
    schedule_dates: List[_RetrieveScheduleDateSchema]
    schedule_time_slots: List[_RetrieveScheduleTimeSlotSchema]
    schedule_date_schedule_time_slots: List[_RetrieveScheduleDateScheduleTimeSlotSchema]


class UpdateScheduleByInternalUserSchema(BaseUpdateEntitySchema):
    class _UpdateScheduleDateScheduleTimeSlotSchema(BaseUpdateEntitySchema):
        class _UpdateScheduleDateScheduleTimeSlotInternalUserSchema(
            BaseUpdateEntitySchema
        ):
            internal_user_reference: Reference

        schedule_date_index: int
        schedule_time_slot_index: int
        override_schedule_time_slot_start_time: Time | None = None
        override_schedule_time_slot_end_time: Time | None = None
        schedule_date_schedule_time_slot_internal_users: List[
            _UpdateScheduleDateScheduleTimeSlotInternalUserSchema
        ]

    schedule_date_schedule_time_slots: List[_UpdateScheduleDateScheduleTimeSlotSchema]
