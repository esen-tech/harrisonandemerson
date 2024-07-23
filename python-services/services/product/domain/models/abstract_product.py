from dataclasses import dataclass

from modules.domain.types import DateTime, Decimal, Reference


@dataclass(kw_only=True)
class AbstractProduct:
    organization_reference: Reference
    display_sku_key: str
    display_description_key: str | None = None
    display_note: str | None = None
    non_covered_price_amount: Decimal
    effective_time: DateTime
    expire_time: DateTime | None = None
