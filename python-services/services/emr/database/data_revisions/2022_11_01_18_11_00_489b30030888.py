from modules.database.migration import DataMigration

revision = "489b30030888"
down_revision = None


async def upgrade(op: DataMigration.Operation):
    from modules.airtable.airtable_api_client import AirtableAPIClient
    from modules.airtable.config import get_config as get_airtable_config
    from modules.airtable.enum import BaseEnum, TableEnum
    from modules.database.config import get_config as get_database_config
    from modules.database.database import Database
    from modules.service_layer.message_bus import MessageBus
    from services.emr.domain import event
    from services.emr.service_layer.handlers import (
        command_handler_map,
        event_handlers_map,
    )
    from services.emr.service_layer.unit_of_work import SqlAlchemyUnitOfWork

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
    airtable_end_users_iterator = airtable_api_client.get_all_iterable_records(
        BaseEnum.ESEN_CLINIC,
        TableEnum.EHR_MASTERSHEET,
        filter_by_formula=f"{{檢查報告上傳}}!=''",
    )
    i = 0
    async for airtable_end_user in airtable_end_users_iterator:
        i += 1
        print(f"i = {i}, record_id = {airtable_end_user['id']}")
        await bus.handle(
            event.AirtableExaminationReportCreated(
                airtable_end_user_reference=airtable_end_user["id"]
            )
        )


async def downgrade(op: DataMigration.Operation):
    raise NotImplemented
