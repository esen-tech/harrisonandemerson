import uuid

from sqlalchemy.orm import backref, configure_mappers, relationship

from modules.database.sa.registry import mapper_registry
from services.scheduling.database.tables.appointment import appointment_table
from services.scheduling.database.tables.internal_user_appointment_time_slot import (
    internal_user_appointment_time_slot_table,
)
from services.scheduling.database.tables.internal_user_time_slot_inventory import (
    internal_user_time_slot_inventory_table,
)
from services.scheduling.database.tables.room_appointment_time_slot import (
    room_appointment_time_slot_table,
)
from services.scheduling.database.tables.room_time_slot_inventory import (
    room_time_slot_inventory_table,
)
from services.scheduling.database.tables.schedule import schedule_table
from services.scheduling.database.tables.schedule_date import schedule_date_table
from services.scheduling.database.tables.schedule_date_schedule_time_slot import (
    schedule_date_schedule_time_slot_table,
)
from services.scheduling.database.tables.schedule_date_schedule_time_slot_internal_user import (
    schedule_date_schedule_time_slot_internal_user_table,
)
from services.scheduling.database.tables.schedule_time_slot import (
    schedule_time_slot_table,
)
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
from services.scheduling.domain.models.room_time_slot_inventory import (
    RoomTimeSlotInventory,
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


def start_mappers():
    mapper_registry.map_imperatively(
        InternalUserTimeSlotInventory,
        internal_user_time_slot_inventory_table,
        version_id_col=internal_user_time_slot_inventory_table.columns._version,
        version_id_generator=lambda _version: uuid.uuid4(),
    )
    mapper_registry.map_imperatively(
        RoomTimeSlotInventory,
        room_time_slot_inventory_table,
        version_id_col=room_time_slot_inventory_table.columns._version,
        version_id_generator=lambda _version: uuid.uuid4(),
    )

    mapper_registry.map_imperatively(
        Appointment,
        appointment_table,
        properties={
            "internal_user_appointment_time_slots": relationship(
                "InternalUserAppointmentTimeSlot", cascade="all, delete-orphan"
            ),
            "room_appointment_time_slots": relationship(
                "RoomAppointmentTimeSlot", cascade="all, delete-orphan"
            ),
        },
    )
    mapper_registry.map_imperatively(
        InternalUserAppointmentTimeSlot,
        internal_user_appointment_time_slot_table,
    )
    mapper_registry.map_imperatively(
        RoomAppointmentTimeSlot,
        room_appointment_time_slot_table,
    )

    mapper_registry.map_imperatively(
        Schedule,
        schedule_table,
        properties={
            "schedule_dates": relationship(
                "ScheduleDate", cascade="all, delete-orphan"
            ),
            "schedule_time_slots": relationship(
                "ScheduleTimeSlot", cascade="all, delete-orphan"
            ),
            "schedule_date_schedule_time_slots": relationship(
                "ScheduleDateScheduleTimeSlot", cascade="all, delete-orphan"
            ),
        },
    )
    mapper_registry.map_imperatively(ScheduleDate, schedule_date_table)
    mapper_registry.map_imperatively(ScheduleTimeSlot, schedule_time_slot_table)
    mapper_registry.map_imperatively(
        ScheduleDateScheduleTimeSlot,
        schedule_date_schedule_time_slot_table,
        properties={
            "schedule_date_schedule_time_slot_internal_users": relationship(
                "ScheduleDateScheduleTimeSlotInternalUser", cascade="all, delete-orphan"
            ),
        },
    )
    mapper_registry.map_imperatively(
        ScheduleDateScheduleTimeSlotInternalUser,
        schedule_date_schedule_time_slot_internal_user_table,
    )

    # Read more on the issue [Backref relationships don't populate in the class until instance is created](https://github.com/sqlalchemy/sqlalchemy/issues/7312)
    # configure_mappers()
