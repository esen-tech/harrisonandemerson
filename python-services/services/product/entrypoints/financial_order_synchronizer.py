from core.decorator import coro
from services.product.database.orm import start_mappers
from services.product.domain import command
from services.product.service_layer.message_bus import get_message_bus

start_mappers()
bus = get_message_bus()
coro(bus.handle)(command.PullPaidOrderFromECPay())
