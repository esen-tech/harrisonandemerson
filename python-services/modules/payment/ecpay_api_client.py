import time
from datetime import datetime
from typing import List

from modules.payment.ecpay_payment_sdk import ECPayPaymentSdk


class ECPayAPIClient:
    def __init__(self, host: str, merchant_id: str, hash_key: str, hash_iv: str):
        self._host = host
        self._sdk = ECPayPaymentSdk(
            MerchantID=merchant_id, HashKey=hash_key, HashIV=hash_iv
        )

    async def get_order(self, ecpay_merchant_trade_no: str) -> dict:
        query_result = self._sdk.order_search(
            action_url=f"{self._host}/Cashier/QueryTradeInfo/V5",
            client_parameters={
                "MerchantTradeNo": ecpay_merchant_trade_no,
                "TimeStamp": int(time.time()),
            },
        )
        return query_result

    async def get_order_payment_html(
        self,
        ecpay_merchant_trade_no: str,
        display_product_names: List[str],
        price_amount_in_twd: int,
        callback_url: str,
    ) -> str:
        # https://developers.ecpay.com.tw/?p=2862
        order_params = {
            "MerchantTradeNo": ecpay_merchant_trade_no,
            "StoreID": "",
            "MerchantTradeDate": datetime.now().strftime("%Y/%m/%d %H:%M:%S"),
            "PaymentType": "aio",
            "TotalAmount": price_amount_in_twd,
            "TradeDesc": "no-ops",
            "ItemName": "#".join(display_product_names),
            "ReturnURL": callback_url,  # ReturnURL為付款結果通知回傳網址，為特店server或主機的URL，用來接收綠界後端回傳的付款結果通知。
            "ChoosePayment": "ALL",
            "ClientBackURL": "https://www.esenmedical.com/esen-care",  # 消費者點選此按鈕後，會將頁面導回到此設定的網址
            "ItemURL": "https://www.ecpay.com.tw/item_url.php",
            "Remark": "交易備註",
            "ChooseSubPayment": "",
            # "OrderResultURL": "https://www.ecpay.com.tw/order_result_url.php",  # 有別於ReturnURL (server端的網址)，OrderResultURL為特店的client端(前端)網址。消費者付款完成後，綠界會將付款結果參數以POST方式回傳到到該網址。詳細說明請參考付款結果通知。
            "NeedExtraPaidInfo": "Y",
            "DeviceSource": "",
            "IgnorePayment": "ATM#CVS#BARCODE",
            "PlatformID": "",
            "InvoiceMark": "N",
            "CustomField1": "",
            "CustomField2": "",
            "CustomField3": "",
            "CustomField4": "",
            "EncryptType": 1,
        }
        params = self._sdk.create_order(order_params)
        html = self._sdk.gen_html_post_form(
            f"{self._host}/Cashier/AioCheckOut/V5", params
        )
        return html
