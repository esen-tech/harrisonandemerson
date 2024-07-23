from typing import Type

from modules.adapter.repository import SqlAlchemyRepository
from services.marketing.domain.models.promo_code import PromoCode


class PromoCodeRepository(SqlAlchemyRepository[PromoCode]):
    @property
    def _model(self) -> Type[PromoCode]:
        return PromoCode
