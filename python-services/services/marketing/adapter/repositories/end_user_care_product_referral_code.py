from typing import Type

from modules.adapter.repository import SqlAlchemyRepository
from services.marketing.domain.models.end_user_care_product_referral_code import (
    EndUserCareProductReferralCode,
)


class EndUserCareProductReferralCodeRepository(
    SqlAlchemyRepository[EndUserCareProductReferralCode]
):
    @property
    def _model(self) -> Type[EndUserCareProductReferralCode]:
        return EndUserCareProductReferralCode
