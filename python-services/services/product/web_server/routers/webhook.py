from urllib.parse import parse_qs

from fastapi import APIRouter, Depends, Request
from fastapi.responses import PlainTextResponse

from modules.domain.types import Reference
from modules.service_layer.message_bus import MessageBus
from services.product.domain import command
from services.product.web_server.dependencies.message_bus import get_message_bus

router = APIRouter()


@router.post(
    "/financial_orders/{financial_order_reference}/pay_by_ecpay",
    tags=["webhook"],
    response_class=PlainTextResponse,
)
async def on_financial_order_pay_by_ecpay(
    request: Request,
    financial_order_reference: Reference,
    bus: MessageBus = Depends(get_message_bus),
):
    # https://developers.ecpay.com.tw/?p=2878
    raw_body = await request.body()
    ecpay_payment_result = {
        name: values[0] for name, values in parse_qs(raw_body.decode("utf8")).items()
    }

    if ecpay_payment_result["RtnCode"] == "1":
        cmd = command.PayFinancialOrderByWebhook(
            financial_order_reference=financial_order_reference,
            ecpay_payment_result=ecpay_payment_result,
        )
        await bus.handle(cmd)
        return "1|OK"
    else:
        cmd = command.LogFinancialOrderPaymentResult(
            financial_order_reference=financial_order_reference,
            ecpay_payment_result=ecpay_payment_result,
        )
        await bus.handle(cmd)
