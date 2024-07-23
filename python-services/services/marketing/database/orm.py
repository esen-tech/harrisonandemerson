from sqlalchemy.orm import configure_mappers

from modules.database.sa.registry import mapper_registry
from services.marketing.database.tables.cooperation_code import cooperation_code_table
from services.marketing.database.tables.end_user_care_product_referral_code import (
    end_user_care_product_referral_code_table,
)
from services.marketing.database.tables.promo_code import promo_code_table
from services.marketing.domain.models.cooperation_code import CooperationCode
from services.marketing.domain.models.end_user_care_product_referral_code import (
    EndUserCareProductReferralCode,
)
from services.marketing.domain.models.promo_code import PromoCode


def start_mappers():
    mapper_registry.map_imperatively(CooperationCode, cooperation_code_table)
    mapper_registry.map_imperatively(
        EndUserCareProductReferralCode, end_user_care_product_referral_code_table
    )
    mapper_registry.map_imperatively(PromoCode, promo_code_table)

    # Read more on the issue [Backref relationships don't populate in the class until instance is created](https://github.com/sqlalchemy/sqlalchemy/issues/7312)
    configure_mappers()
