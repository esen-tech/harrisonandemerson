from typing import AsyncIterator

from services.marketing.domain.models.end_user_care_product_referral_code import (
    EndUserCareProductReferralCode,
)
from services.marketing.service_layer.unit_of_work import SqlAlchemyUnitOfWork


async def get_end_user_care_product_referral_code_by_code(
    uow: SqlAlchemyUnitOfWork, code: str
) -> AsyncIterator[EndUserCareProductReferralCode | None]:
    async with uow:
        end_user_care_product_referral_code = (
            await uow.end_user_care_product_referral_code_repository.get_by(code=code)
        )
        yield end_user_care_product_referral_code
