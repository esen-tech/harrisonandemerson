from sqlalchemy import Column

from modules.database.enum import StringSizeEnum
from modules.database.sa.types import DateTime, Numeric, Reference, String


def get_abstract_product_columns():
    return [
        Column("organization_reference", Reference, nullable=False, index=True),
        Column("display_sku_key", String(StringSizeEnum.S.value), nullable=False),
        Column("display_description_key", String(StringSizeEnum.L.value)),
        Column("display_note", String(StringSizeEnum.L.value)),
        Column("non_covered_price_amount", Numeric, nullable=False),
        Column("effective_time", DateTime, nullable=False),
        Column("expire_time", DateTime),
    ]
