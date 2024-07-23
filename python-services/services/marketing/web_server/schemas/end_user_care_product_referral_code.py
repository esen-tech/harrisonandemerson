from modules.domain.types import Decimal, Reference
from modules.web_server.schemas.base import BaseRetrieveEntitySchema


class RetrieveCrossServiceEndUserCareProductReferralCodeSchema(
    BaseRetrieveEntitySchema
):
    end_user_reference: Reference
    code: str
    referee_financial_order_discount_price_amount: Decimal
