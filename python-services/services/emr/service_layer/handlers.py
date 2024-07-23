import json
import tempfile
import uuid

import httpx
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload

from core.config import get_config as get_core_config
from modules.airtable.airtable_api_client import AirtableAPIClient
from modules.airtable.config import get_config as get_airtable_config
from modules.airtable.enum import BaseEnum, TableEnum
from modules.cross_service.cross_service_api_agent import CrossServiceAPIClient
from modules.domain.views.filter_view_enhancer import FilterContextSchema
from modules.domain.views.load_view_enhancer import LoadContextSchema
from modules.domain.views.view_enhancer import ViewEnhancement
from modules.pubsub.event import EventPublisher
from modules.service_layer.message_bus import MessageBus
from modules.storage.config import get_config as get_storage_config
from modules.storage.storage import GoogleCloudStorageEngine, StorageObject
from modules.storage.utils import get_md5_hash
from modules.web_server.config import get_config as get_web_server_config
from services.emr.domain import command, event
from services.emr.domain.models.care_case import CareCase
from services.emr.domain.models.care_case_review import CareCaseReview
from services.emr.domain.models.examination_report import ExaminationReport
from services.emr.domain.models.file import File
from services.emr.domain.models.file_group import FileGroup
from services.emr.domain.views.filter_view_enhancer import (
    ExaminationReportFilterEnum,
    FileFilterEnum,
    examination_report_filter_view_enhancer,
    file_filter_view_enhancer,
)
from services.emr.domain.views.load_view_enhancer import (
    EMRLoadEnum,
    emr_load_view_enhancer,
)
from services.emr.service_layer.unit_of_work import SqlAlchemyUnitOfWork


async def create_examination_report(
    command: command.CreateExaminationReport,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    async with uow:
        examination_report = ExaminationReport(
            organization_reference=command.payload.organization_reference,
            end_user_reference=command.end_user_reference,
            file_group=FileGroup(
                display_name=command.payload.file_group.display_name,
            ),
        )
        await uow.examination_report_repository.add(examination_report)
        await uow.commit()


async def create_examination_report_file(
    command: command.CreateExaminationReportFile,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    core_config = get_core_config()
    storage_config = get_storage_config()
    storage_engine = GoogleCloudStorageEngine(
        raw_credentials=json.loads(storage_config.STORAGE_ENGINE_CREDENTIALS)
    )

    async with uow:
        examination_report = (
            await uow.examination_report_repository.get_by_view_enhancements(
                [
                    ViewEnhancement(
                        enhancer=emr_load_view_enhancer,
                        context=LoadContextSchema(
                            type=EMRLoadEnum.EXAMINATION_REPORT.value
                        ),
                    ),
                    ViewEnhancement(
                        enhancer=examination_report_filter_view_enhancer,
                        context=FilterContextSchema(
                            type=ExaminationReportFilterEnum.REFERENCE.value,
                            query=command.examination_report_reference,
                        ),
                    ),
                ]
            )
        )
        file_reference = uuid.uuid4()
        storage_engine.put(
            storage_config.STORAGE_BUCKET_NAME,
            f"managed/{core_config.SERVICE_NAME}/examination_reports/{examination_report.file_group.reference}/{file_reference}",
            command.storage_object,
        )
        file = File(
            reference=file_reference,
            file_group=examination_report.file_group,
            hash=command.hash,
            display_name=command.display_name,
            raw_name=command.raw_name,
            content_type=command.content_type,
            size_in_byte=command.size_in_byte,
        )
        await uow.file_repository.add(file)
        await uow.commit()


async def delete_examination_report_file(
    command: command.DeleteExaminationReportFile,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    core_config = get_core_config()
    storage_config = get_storage_config()
    storage_engine = GoogleCloudStorageEngine(
        raw_credentials=json.loads(storage_config.STORAGE_ENGINE_CREDENTIALS)
    )

    async with uow:
        file = await uow.file_repository.get_by_view_enhancements(
            [
                ViewEnhancement(
                    enhancer=emr_load_view_enhancer,
                    context=LoadContextSchema(type=EMRLoadEnum.FILE.value),
                ),
                ViewEnhancement(
                    enhancer=file_filter_view_enhancer,
                    context=FilterContextSchema(
                        type=FileFilterEnum.REFERENCE.value,
                        query=command.reference,
                    ),
                ),
            ]
        )
        storage_engine.delete(
            storage_config.STORAGE_BUCKET_NAME,
            f"managed/{core_config.SERVICE_NAME}/examination_reports/{file.file_group.reference}/{command.reference}",
        )
        await uow.file_repository.delete_by_reference(command.reference)
        await uow.commit()


async def delete_examination_report(
    command: command.DeleteExaminationReport,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    core_config = get_core_config()
    storage_config = get_storage_config()
    storage_engine = GoogleCloudStorageEngine(
        raw_credentials=json.loads(storage_config.STORAGE_ENGINE_CREDENTIALS)
    )

    async with uow:
        examination_report = (
            await uow.examination_report_repository.get_by_view_enhancements(
                [
                    ViewEnhancement(
                        enhancer=emr_load_view_enhancer,
                        context=LoadContextSchema(
                            type=EMRLoadEnum.EXAMINATION_REPORT.value
                        ),
                    ),
                    ViewEnhancement(
                        enhancer=examination_report_filter_view_enhancer,
                        context=FilterContextSchema(
                            type=FileFilterEnum.EXAMINATION_REPORT_REFERENCE.value,
                            query=command.reference,
                        ),
                    ),
                ]
            )
        )
        storage_engine.bulk_delete(
            storage_config.STORAGE_BUCKET_NAME,
            f"managed/{core_config.SERVICE_NAME}/examination_reports/{examination_report.file_group.reference}",
        )
        await uow.examination_report_repository.delete_by_reference(command.reference)
        await uow.commit()


async def pull_airtable_care_case(
    command: command.PullAirtableCareCase,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    airtable_config = get_airtable_config()
    airtable_api_client = AirtableAPIClient(airtable_config.AIRTABLE_API_KEY)
    airtable_care_case = await airtable_api_client.get_record_by_id(
        BaseEnum.ESEN_CARE,
        TableEnum.案件,
        command.airtable_reference,
    )

    web_server_config = get_web_server_config()
    cross_service_api_client = CrossServiceAPIClient(web_server_config.IAM_API_HOST)
    end_user_dict = await cross_service_api_client.get(
        "/cross_service/end_user",
        params={
            "care_airtable_reference": airtable_care_case["fields"]["客戶 Record ID"][0]
        },
    )

    async with uow:
        care_case = await uow.care_case_repository.get_by(
            care_airtable_reference=command.airtable_reference
        )
        if care_case is None:
            care_case = CareCase(
                subject_end_user_reference=end_user_dict["reference"],
                assignee_internal_user_reference=airtable_config.AIRTABLE_健管師_RECORD_ID_TO_INTERNAL_USER_REFERENCE_MAP[
                    airtable_care_case["fields"]["健管師 Record ID"][0]
                ],
                ecpay_order_id="",
                state=CareCase.StateEnum.CREATED.value,
                total_appointment_inventory_count_for_doctor=1,
                allocated_appointment_inventory_count_for_doctor=0,
                total_appointment_inventory_count_for_care_manager=2,
                allocated_appointment_inventory_count_for_care_manager=0,
                care_airtable_reference=command.airtable_reference,
                care_case_reviews=[],
            )
            await uow.care_case_repository.add(care_case)

        care_case_review_airtable_reference_map = {
            care_case_review.care_airtable_reference: care_case_review
            for care_case_review in care_case.care_case_reviews
        }
        for airtable_care_case_review_reference in airtable_care_case["fields"]["案件筆記"]:
            airtable_care_case_review = await airtable_api_client.get_record_by_id(
                BaseEnum.ESEN_CARE,
                TableEnum.案件筆記,
                airtable_care_case_review_reference,
            )
            care_case_review = care_case_review_airtable_reference_map.get(
                airtable_care_case_review_reference
            )
            if care_case_review is None:
                care_case_review = CareCaseReview(
                    care_airtable_reference=airtable_care_case_review["id"],
                )
                care_case.care_case_reviews.append(care_case_review)
            care_case_review.care_manager_private_note = airtable_care_case_review[
                "fields"
            ].get("健管師私人筆記")
            care_case_review.display_subjective = airtable_care_case_review[
                "fields"
            ].get("S（Emerson 顯示用）")
            care_case_review.display_objective = airtable_care_case_review[
                "fields"
            ].get("O（Emerson 顯示用）")
            care_case_review.display_assessment = airtable_care_case_review[
                "fields"
            ].get("A（Emerson 顯示用）")
            care_case_review.display_plan = airtable_care_case_review["fields"].get(
                "P（Emerson 顯示用）"
            )

        await uow.commit()


async def pull_airtable_examination_report(
    event: event.AirtableExaminationReportCreated,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    core_config = get_core_config()
    web_server_config = get_web_server_config()
    storage_config = get_storage_config()
    airtable_config = get_airtable_config()
    cross_service_api_client = CrossServiceAPIClient(web_server_config.IAM_API_HOST)
    storage_engine = GoogleCloudStorageEngine(
        raw_credentials=json.loads(storage_config.STORAGE_ENGINE_CREDENTIALS)
    )
    airtable_api_client = AirtableAPIClient(airtable_config.AIRTABLE_API_KEY)

    end_user_dict = await cross_service_api_client.get(
        "/cross_service/end_user",
        params={"airtable_reference": event.airtable_end_user_reference},
    )
    airtable_end_user = await airtable_api_client.get_record_by_id(
        BaseEnum.ESEN_CLINIC,
        TableEnum.EHR_MASTERSHEET,
        event.airtable_end_user_reference,
    )
    airtable_examination_reports = airtable_end_user["fields"]["檢查報告上傳"]

    async with uow:
        statement = (
            select(ExaminationReport)
            .join(ExaminationReport.file_group)
            .options(joinedload(ExaminationReport.file_group))
            .where(
                ExaminationReport.end_user_reference == end_user_dict["reference"],
                FileGroup.display_name
                == airtable_config.EXAMINATION_REPORT_FILE_GROUP_NAME,
            )
        )
        result = await uow.session.execute(statement)
        examination_report = result.scalars().first()
        if examination_report is None:
            examination_report = ExaminationReport(
                organization_reference=airtable_config.ESEN_CLINIC_ORGANIZATION_REFERENCE,
                end_user_reference=end_user_dict["reference"],
                file_group=FileGroup(
                    display_name=airtable_config.EXAMINATION_REPORT_FILE_GROUP_NAME,
                ),
            )
            await uow.examination_report_repository.add(examination_report)

        statement = (
            select(File)
            .options(joinedload(File.file_group))
            .where(FileGroup.reference == examination_report.file_group.reference)
        )
        result = await uow.session.execute(statement)
        files = result.scalars().unique().all()
        existing_file_raw_name_set = {file.raw_name for file in files}

        for airtable_examination_report in airtable_examination_reports:
            # ignore non-pdf files
            if (
                airtable_examination_report["type"]
                != File.ContentTypeEnum.APPLICATION_PDF.value
            ):
                continue

            # ignore uploaded files
            filename, content_type, size_in_byte = (
                airtable_examination_report["filename"],
                airtable_examination_report["type"],
                airtable_examination_report["size"],
            )
            if filename in existing_file_raw_name_set:
                continue

            # download file
            with tempfile.TemporaryFile("w+b") as downloaded_file:
                async with httpx.AsyncClient() as client:
                    res = await client.get(airtable_examination_report["url"])
                    downloaded_file.write(res.content)
                    downloaded_file.seek(0)

                # create local file entity
                file_reference = uuid.uuid4()
                file = File(
                    reference=file_reference,
                    file_group=examination_report.file_group,
                    hash=get_md5_hash(downloaded_file),
                    display_name=filename,
                    raw_name=filename,
                    content_type=content_type,
                    size_in_byte=size_in_byte,
                )
                await uow.file_repository.add(file)

                # upload file
                storage_engine.put(
                    storage_config.STORAGE_BUCKET_NAME,
                    f"managed/{core_config.SERVICE_NAME}/examination_reports/{examination_report.file_group.reference}/{file_reference}",
                    StorageObject(downloaded_file),
                )

        await uow.commit()


command_handler_map = {
    command.CreateExaminationReport: create_examination_report,
    command.CreateExaminationReportFile: create_examination_report_file,
    command.DeleteExaminationReportFile: delete_examination_report_file,
    command.DeleteExaminationReport: delete_examination_report,
    command.PullAirtableCareCase: pull_airtable_care_case,
}

event_handlers_map = {
    event.AirtableExaminationReportCreated: [pull_airtable_examination_report],
}
