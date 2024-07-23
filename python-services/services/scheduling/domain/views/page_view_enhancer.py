from modules.domain.views.page_view_enhancer import DirectionEnum, PageViewEnhancer
from services.scheduling.database.tables.appointment import appointment_table
from services.scheduling.database.tables.schedule import schedule_table

schedule_page_view_enhancer = PageViewEnhancer(
    [
        (schedule_table.columns.create_time, DirectionEnum.DESC),
    ]
)

appointment_page_view_enhancer = PageViewEnhancer(
    [
        (appointment_table.columns.create_time, DirectionEnum.DESC),
    ]
)

internal_appointment_page_view_enhancer = PageViewEnhancer(
    [
        (appointment_table.columns._evaluated_time_slot_start_time, DirectionEnum.DESC),
    ]
)
