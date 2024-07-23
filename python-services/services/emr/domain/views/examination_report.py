import json
from datetime import timedelta
from typing import List

from core.config import get_config as get_core_config
from modules.domain.views.view_enhancer import EnhancedViewSchema, ViewEnhancement
from modules.storage.config import get_config as get_storage_config
from modules.storage.storage import GoogleCloudStorageEngine
from services.emr.service_layer.unit_of_work import SqlAlchemyUnitOfWork
from services.emr.web_server.schemas.examination_report import (
    RetrieveExaminationReportDetailSchema,
    RetrieveExaminationReportSummarySchema,
    RetrieveFileDetailSchema,
    RetrieveFileSummarySchema,
)


async def get_examination_reports_by_load_and_filter_and_page(
    uow: SqlAlchemyUnitOfWork,
    load_view_enhancement: ViewEnhancement,
    filter_view_enhancement: ViewEnhancement,
    page_view_enhancement: ViewEnhancement,
) -> EnhancedViewSchema[List[RetrieveExaminationReportSummarySchema]]:
    async with uow:
        enhanced_entities = (
            await uow.examination_report_repository.get_all_by_view_enhancements(
                [load_view_enhancement, filter_view_enhancement, page_view_enhancement]
            )
        )
        count = await uow.examination_report_repository.get_count_by_view_enhancements(
            [filter_view_enhancement]
        )
        return EnhancedViewSchema[List[RetrieveExaminationReportSummarySchema]](
            enhanced_data=[
                RetrieveExaminationReportSummarySchema.from_orm(entry)
                for entry in enhanced_entities
            ],
            metadata={
                "page": page_view_enhancement.enhancer.get_metadata(
                    context=page_view_enhancement.context,
                    enhanced_entities=enhanced_entities,
                    count_all_page=count,
                ),
            },
        )


async def get_examination_report_detail_by_load_and_filter(
    uow: SqlAlchemyUnitOfWork,
    load_view_enhancement: ViewEnhancement,
    filter_view_enhancement: ViewEnhancement,
) -> EnhancedViewSchema[RetrieveExaminationReportDetailSchema]:
    async with uow:
        enhanced_entity = (
            await uow.examination_report_repository.get_by_view_enhancements(
                [load_view_enhancement, filter_view_enhancement]
            )
        )
        return EnhancedViewSchema[RetrieveExaminationReportDetailSchema](
            enhanced_data=RetrieveExaminationReportSummarySchema.from_orm(
                enhanced_entity
            )
        )


async def get_examination_report_files_by_load_and_filter_and_page(
    uow: SqlAlchemyUnitOfWork,
    load_view_enhancement: ViewEnhancement,
    filter_view_enhancement: ViewEnhancement,
    page_view_enhancement: ViewEnhancement,
) -> EnhancedViewSchema[List[RetrieveFileSummarySchema]]:
    async with uow:
        enhanced_entities = await uow.file_repository.get_all_by_view_enhancements(
            [load_view_enhancement, filter_view_enhancement, page_view_enhancement]
        )
        count = await uow.file_repository.get_count_by_view_enhancements(
            [filter_view_enhancement]
        )
        return EnhancedViewSchema[List[RetrieveFileSummarySchema]](
            enhanced_data=[
                RetrieveFileSummarySchema.from_orm(entry) for entry in enhanced_entities
            ],
            metadata={
                "page": page_view_enhancement.enhancer.get_metadata(
                    context=page_view_enhancement.context,
                    enhanced_entities=enhanced_entities,
                    count_all_page=count,
                ),
            },
        )


async def get_examination_report_file_by_load_and_filter(
    uow: SqlAlchemyUnitOfWork,
    load_view_enhancement: ViewEnhancement,
    filter_view_enhancement: ViewEnhancement,
) -> EnhancedViewSchema[RetrieveFileDetailSchema]:
    core_config = get_core_config()
    storage_config = get_storage_config()
    storage_engine = GoogleCloudStorageEngine(
        raw_credentials=json.loads(storage_config.STORAGE_ENGINE_CREDENTIALS)
    )
    async with uow:
        enhanced_entity = await uow.file_repository.get_by_view_enhancements(
            [load_view_enhancement, filter_view_enhancement]
        )
        enhanced_data = RetrieveFileDetailSchema.from_orm(enhanced_entity)
        enhanced_data.url = storage_engine.request_url(
            storage_config.STORAGE_BUCKET_NAME,
            f"managed/{core_config.SERVICE_NAME}/examination_reports/{enhanced_entity.file_group.reference}/{enhanced_entity.reference}",
            timedelta(minutes=1),
            response_type=enhanced_entity.content_type,
        )
        return EnhancedViewSchema[RetrieveFileDetailSchema](enhanced_data=enhanced_data)
