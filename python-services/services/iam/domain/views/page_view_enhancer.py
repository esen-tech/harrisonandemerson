from modules.domain.views.page_view_enhancer import DirectionEnum, PageViewEnhancer
from services.iam.database.tables.end_user import end_user_table
from services.iam.database.tables.organization_internal_user import (
    organization_internal_user_table,
)
from services.iam.database.tables.team import team_table

end_user_page_view_enhancer = PageViewEnhancer(
    [
        (end_user_table.columns.create_time, DirectionEnum.DESC),
        # (end_user_table.columns.birth_date, DirectionEnum.ASC), # comment out since birth_date could be nullable
    ]
)

organization_internal_user_page_view_enhancer = PageViewEnhancer(
    [
        (organization_internal_user_table.columns.update_time, DirectionEnum.DESC),
    ]
)

team_page_view_enhancer = PageViewEnhancer(
    [
        (team_table.columns.update_time, DirectionEnum.DESC),
    ]
)
