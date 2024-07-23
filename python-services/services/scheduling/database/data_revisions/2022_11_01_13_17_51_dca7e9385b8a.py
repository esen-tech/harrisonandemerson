from modules.database.migration import DataMigration

revision = "dca7e9385b8a"
down_revision = None


async def upgrade(op: DataMigration.Operation):
    from modules.airtable.airtable_api_client import AirtableAPIClient
    from modules.airtable.config import get_config as get_airtable_config
    from modules.airtable.enum import BaseEnum, TableEnum
    from modules.database.config import get_config as get_database_config
    from modules.database.database import Database
    from modules.service_layer.message_bus import MessageBus
    from services.scheduling.domain import event
    from services.scheduling.service_layer.handlers import (
        command_handler_map,
        event_handlers_map,
    )
    from services.scheduling.service_layer.unit_of_work import SqlAlchemyUnitOfWork

    database_config = get_database_config()
    database = Database(
        database_config.DATABASE_URL, schema_name=database_config.SCHEMA_NAME
    )
    bus = MessageBus(
        uow=SqlAlchemyUnitOfWork(database),
        event_handlers_map=event_handlers_map,
        command_handler_map=command_handler_map,
    )

    airtable_config = get_airtable_config()
    airtable_api_client = AirtableAPIClient(airtable_config.AIRTABLE_API_KEY)
    airtable_visits_iterator = airtable_api_client.get_all_iterable_records(
        BaseEnum.ESEN_CLINIC,
        TableEnum.VISIT,
        fields=["門診類別", "就診狀態"],
        filter_by_formula="DATETIME_DIFF({日期 Date}, '11/01/2022', 'minutes') >= 0",
    )
    async for airtable_visit in airtable_visits_iterator:
        if airtable_visit["fields"].get("門診類別") not in (
            "一般門診諮詢",
            "超音波服務",
            "深度門診諮詢",
            "減壓門診諮詢",
            "減敏門診諮詢",
            "減重門診諮詢",
            "一般門診諮詢 (English-speaking service)",
        ):
            continue

        if airtable_visit["fields"].get("就診狀態") not in (
            "就醫預約",
            "已到診",
            "看診中",
            "診後衛教",
            "就診結束",
        ):
            continue

        print(airtable_visit["id"])

        await bus.handle(
            event.AirtableVisitUpserted(airtable_reference=airtable_visit["id"])
        )


async def downgrade(op: DataMigration.Operation):
    raise NotImplemented
