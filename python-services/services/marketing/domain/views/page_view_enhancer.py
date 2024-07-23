from modules.domain.views.page_view_enhancer import DirectionEnum, PageViewEnhancer
from services.marketing.database.tables.promo_code import promo_code_table

promo_code_page_view_enhancer = PageViewEnhancer(
    [
        (promo_code_table.columns.effective_time, DirectionEnum.DESC),
    ]
)
