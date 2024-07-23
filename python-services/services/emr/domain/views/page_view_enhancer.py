from modules.domain.views.page_view_enhancer import DirectionEnum, PageViewEnhancer
from services.emr.database.tables.examination_report import examination_report_table
from services.emr.database.tables.file import file_table

examination_report_page_view_enhancer = PageViewEnhancer(
    [
        (examination_report_table.columns.create_time, DirectionEnum.DESC),
    ]
)

file_page_view_enhancer = PageViewEnhancer(
    [
        (file_table.columns.create_time, DirectionEnum.DESC),
    ]
)
