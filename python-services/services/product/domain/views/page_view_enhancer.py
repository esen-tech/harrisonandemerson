from modules.domain.views.page_view_enhancer import DirectionEnum, PageViewEnhancer
from services.product.database.tables.care_product import care_product_table
from services.product.database.tables.financial_order import financial_order_table
from services.product.database.tables.service_product import service_product_table

service_product_page_view_enhancer = PageViewEnhancer(
    [
        (service_product_table.columns.create_time, DirectionEnum.DESC),
    ]
)

care_product_page_view_enhancer = PageViewEnhancer(
    [
        (care_product_table.columns.create_time, DirectionEnum.DESC),
    ]
)

financial_order_page_view_enhancer = PageViewEnhancer(
    [
        (financial_order_table.columns.create_time, DirectionEnum.DESC),
    ]
)
