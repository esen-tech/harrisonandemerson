from dataclasses import dataclass

from modules.domain.command import Command
from modules.domain.types import Reference
from services.product.web_server.schemas.order import (
    CreateOrderByGuestSchema,
    CreateOrderByOrganizationSchema,
)
from services.product.web_server.schemas.product import (
    CreateCareProductByInternalUserSchema,
    CreateServiceProductByInternalUserSchema,
    UpdateCareProductByInternalUserSchema,
    UpdateServiceProductByInternalUserSchema,
)


@dataclass
class CreateServiceProductByInternalUser(Command):
    service_product_reference: Reference
    organization_reference: Reference
    payload: CreateServiceProductByInternalUserSchema


@dataclass
class CreateCareProductByInternalUser(Command):
    care_product_reference: Reference
    organization_reference: Reference
    payload: CreateCareProductByInternalUserSchema


@dataclass
class UpdateServiceProductByInternalUser(Command):
    service_product_reference: Reference
    payload: UpdateServiceProductByInternalUserSchema


@dataclass
class UpdateCareProductByInternalUser(Command):
    care_product_reference: Reference
    payload: UpdateCareProductByInternalUserSchema


@dataclass
class CreateOrderByGuest(Command):
    financial_order_reference: Reference
    payload: CreateOrderByGuestSchema


@dataclass
class CreateOrderByOrganization(Command):
    financial_order_reference: Reference
    organization_reference: Reference
    payload: CreateOrderByOrganizationSchema


@dataclass
class PayFinancialOrderByWebhook(Command):
    financial_order_reference: Reference
    ecpay_payment_result: dict | None


@dataclass
class PayFinancialOrderByOrganization(Command):
    financial_order_reference: Reference


@dataclass
class PayFinancialOrderBySynchronizer(Command):
    financial_order_reference: Reference
    ecpay_order_dict: dict | None


@dataclass
class LogFinancialOrderPaymentResult(Command):
    financial_order_reference: Reference
    ecpay_payment_result: dict | None


@dataclass
class PullPaidOrderFromECPay(Command):
    pass
