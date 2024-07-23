from sqlalchemy.orm import backref, configure_mappers, relationship

from modules.database.sa.registry import mapper_registry
from services.product.database.tables.care_product import care_product_table
from services.product.database.tables.care_product_image import care_product_image_table
from services.product.database.tables.care_product_promo_code import (
    care_product_promo_code_table,
)
from services.product.database.tables.delivery_order import delivery_order_table
from services.product.database.tables.financial_order import financial_order_table
from services.product.database.tables.service_product import service_product_table
from services.product.database.tables.service_product_insurer import (
    service_product_insurer_table,
)
from services.product.database.tables.service_product_internal_user import (
    service_product_internal_user_table,
)
from services.product.domain.models.care_product import CareProduct
from services.product.domain.models.care_product_image import CareProductImage
from services.product.domain.models.care_product_promo_code import CareProductPromoCode
from services.product.domain.models.delivery_order import DeliveryOrder
from services.product.domain.models.financial_order import FinancialOrder
from services.product.domain.models.service_product import ServiceProduct
from services.product.domain.models.service_product_insurer import ServiceProductInsurer
from services.product.domain.models.service_product_internal_user import (
    ServiceProductInternalUser,
)


def start_mappers():
    mapper_registry.map_imperatively(ServiceProduct, service_product_table)
    mapper_registry.map_imperatively(
        ServiceProductInsurer,
        service_product_insurer_table,
        properties={
            "service_product": relationship(
                "ServiceProduct",
                backref=backref(
                    "service_product_insurers", cascade="all, delete-orphan"
                ),
            ),
        },
    )
    mapper_registry.map_imperatively(
        ServiceProductInternalUser,
        service_product_internal_user_table,
        properties={
            "service_product": relationship(
                "ServiceProduct",
                backref=backref(
                    "service_product_internal_users", cascade="all, delete-orphan"
                ),
            ),
        },
    )
    mapper_registry.map_imperatively(
        CareProduct,
        care_product_table,
        properties={
            "care_product_images": relationship(
                "CareProductImage", cascade="all, delete-orphan"
            ),
            "care_product_promo_codes": relationship(
                "CareProductPromoCode", cascade="all, delete-orphan"
            ),
        },
    )
    mapper_registry.map_imperatively(CareProductImage, care_product_image_table)
    mapper_registry.map_imperatively(
        CareProductPromoCode, care_product_promo_code_table
    )
    mapper_registry.map_imperatively(
        FinancialOrder,
        financial_order_table,
    )
    mapper_registry.map_imperatively(DeliveryOrder, delivery_order_table)

    # Read more on the issue [Backref relationships don't populate in the class until instance is created](https://github.com/sqlalchemy/sqlalchemy/issues/7312)
    configure_mappers()
