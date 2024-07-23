import os
from typing import List

from fastapi import APIRouter, Depends, UploadFile

from modules.domain.types import Reference
from modules.domain.views.filter_view_enhancer import FilterContextSchema
from modules.domain.views.load_view_enhancer import LoadContextSchema
from modules.domain.views.view_enhancer import EnhancedViewSchema, ViewEnhancement
from modules.service_layer.message_bus import MessageBus
from modules.storage.storage import StorageObject
from modules.storage.utils import get_md5_hash
from modules.web_server.dependencies.auth import (
    end_user_login_required,
    get_current_end_user,
    internal_user_identifier_keys_required,
    internal_user_login_required,
)
from modules.web_server.schemas.server import ResponseSchema, StatusEnum
from modules.web_server.schemas.user import CurrentEndUserSchema
from services.emr.domain import command
from services.emr.domain.views import examination_report as examination_report_views
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
from services.emr.domain.views.page_view_enhancer import (
    examination_report_page_view_enhancer,
    file_page_view_enhancer,
)
from services.emr.web_server.dependencies.message_bus import get_message_bus
from services.emr.web_server.schemas.examination_report import (
    CreateExaminationReportSchema,
    RetrieveExaminationReportDetailSchema,
    RetrieveExaminationReportSummarySchema,
    RetrieveFileDetailSchema,
    RetrieveFileSummarySchema,
)

router = APIRouter()


@router.post(
    "/organizations/{organization_reference}/end_users/{end_user_reference}/examination_reports",
    tags=["examination_report"],
    dependencies=[
        Depends(internal_user_login_required),
        Depends(internal_user_identifier_keys_required({"EMR_EDITOR"})),
    ],
    response_model=ResponseSchema[RetrieveExaminationReportSummarySchema],
)
async def create_examination_report(
    organization_reference: Reference,
    end_user_reference: Reference,
    payload: CreateExaminationReportSchema,
    bus: MessageBus = Depends(get_message_bus),
):
    cmd = command.CreateExaminationReport(
        end_user_reference=end_user_reference, payload=payload
    )
    await bus.handle(cmd)

    return ResponseSchema[RetrieveExaminationReportSummarySchema](
        status=StatusEnum.SUCCESS
    )


@router.get(
    "/end_users/me/examination_reports",
    tags=["examination_report"],
    dependencies=[
        Depends(end_user_login_required),
    ],
    response_model=ResponseSchema[
        EnhancedViewSchema[List[RetrieveExaminationReportSummarySchema]]
    ],
)
async def get_current_end_user_examination_reports(
    end_user: CurrentEndUserSchema = Depends(get_current_end_user),
    page_context=Depends(examination_report_page_view_enhancer.get_context),
    bus: MessageBus = Depends(get_message_bus),
):
    data = await examination_report_views.get_examination_reports_by_load_and_filter_and_page(
        bus.uow,
        ViewEnhancement(
            enhancer=emr_load_view_enhancer,
            context=LoadContextSchema(type=EMRLoadEnum.EXAMINATION_REPORT.value),
        ),
        ViewEnhancement(
            enhancer=examination_report_filter_view_enhancer,
            context=FilterContextSchema(
                type=ExaminationReportFilterEnum.END_USER_REFERENCE.value,
                query=end_user.reference,
            ),
        ),
        ViewEnhancement(
            enhancer=examination_report_page_view_enhancer, context=page_context
        ),
    )
    return ResponseSchema[
        EnhancedViewSchema[List[RetrieveExaminationReportSummarySchema]]
    ](status=StatusEnum.SUCCESS, data=data)


@router.get(
    "/organizations/{organization_reference}/end_users/{end_user_reference}/examination_reports",
    tags=["examination_report"],
    dependencies=[
        Depends(internal_user_login_required),
        Depends(internal_user_identifier_keys_required({"EMR_READER"})),
    ],
    response_model=ResponseSchema[
        EnhancedViewSchema[List[RetrieveExaminationReportSummarySchema]]
    ],
)
async def get_end_user_examination_reports(
    organization_reference: Reference,
    end_user_reference: Reference,
    page_context=Depends(examination_report_page_view_enhancer.get_context),
    bus: MessageBus = Depends(get_message_bus),
):
    data = await examination_report_views.get_examination_reports_by_load_and_filter_and_page(
        bus.uow,
        ViewEnhancement(
            enhancer=emr_load_view_enhancer,
            context=LoadContextSchema(type=EMRLoadEnum.EXAMINATION_REPORT.value),
        ),
        ViewEnhancement(
            enhancer=examination_report_filter_view_enhancer,
            context=FilterContextSchema(
                type=ExaminationReportFilterEnum.END_USER_REFERENCE.value,
                query=end_user_reference,
            ),
        ),
        ViewEnhancement(
            enhancer=examination_report_page_view_enhancer, context=page_context
        ),
    )
    return ResponseSchema[
        EnhancedViewSchema[List[RetrieveExaminationReportSummarySchema]]
    ](status=StatusEnum.SUCCESS, data=data)


@router.get(
    "/end_users/me/examination_reports/{examination_report_reference}",
    tags=["examination_report"],
    dependencies=[
        Depends(end_user_login_required),
    ],
    response_model=ResponseSchema[
        EnhancedViewSchema[RetrieveExaminationReportDetailSchema]
    ],
)
async def get_current_end_user_examination_report(
    examination_report_reference: Reference,
    bus: MessageBus = Depends(get_message_bus),
):
    data = (
        await examination_report_views.get_examination_report_detail_by_load_and_filter(
            bus.uow,
            ViewEnhancement(
                enhancer=emr_load_view_enhancer,
                context=LoadContextSchema(type=EMRLoadEnum.EXAMINATION_REPORT.value),
            ),
            ViewEnhancement(
                enhancer=examination_report_filter_view_enhancer,
                context=FilterContextSchema(
                    type=ExaminationReportFilterEnum.REFERENCE.value,
                    query=examination_report_reference,
                ),
            ),
        )
    )
    return ResponseSchema[EnhancedViewSchema[RetrieveExaminationReportDetailSchema]](
        status=StatusEnum.SUCCESS, data=data
    )


@router.post(
    "/organizations/{organization_reference}/end_users/{end_user_reference}/examination_reports/{examination_report_reference}/files",
    tags=["examination_report"],
    dependencies=[
        Depends(internal_user_login_required),
        Depends(internal_user_identifier_keys_required({"EMR_EDITOR"})),
    ],
    response_model=ResponseSchema,
)
async def create_examination_report_file(
    organization_reference: Reference,
    end_user_reference: Reference,
    examination_report_reference: Reference,
    upload_file: UploadFile,
    bus: MessageBus = Depends(get_message_bus),
):
    cmd = command.CreateExaminationReportFile(
        examination_report_reference=examination_report_reference,
        hash=get_md5_hash(upload_file.file),
        display_name=upload_file.filename,
        raw_name=upload_file.filename,
        content_type=upload_file.content_type,
        size_in_byte=os.fstat(upload_file.file.fileno()).st_size,
        storage_object=StorageObject.from_upload_file(upload_file),
    )
    await bus.handle(cmd)
    return ResponseSchema(status=StatusEnum.SUCCESS)


@router.get(
    "/end_users/me/examination_reports/{examination_report_reference}/files",
    tags=["examination_report"],
    dependencies=[Depends(end_user_login_required)],
    response_model=ResponseSchema[EnhancedViewSchema[List[RetrieveFileSummarySchema]]],
)
async def get_current_end_user_examination_report_files(
    examination_report_reference: Reference,
    end_user: CurrentEndUserSchema = Depends(get_current_end_user),
    page_context=Depends(file_page_view_enhancer.get_context),
    bus: MessageBus = Depends(get_message_bus),
):
    data = await examination_report_views.get_examination_report_files_by_load_and_filter_and_page(
        bus.uow,
        ViewEnhancement(
            enhancer=emr_load_view_enhancer,
            context=LoadContextSchema(type=EMRLoadEnum.FILE.value),
        ),
        ViewEnhancement(
            enhancer=file_filter_view_enhancer,
            context=FilterContextSchema(
                type=FileFilterEnum.EXAMINATION_REPORT_REFERENCE.value,
                query=examination_report_reference,
            ),
        ),
        ViewEnhancement(enhancer=file_page_view_enhancer, context=page_context),
    )
    return ResponseSchema[EnhancedViewSchema[List[RetrieveFileSummarySchema]]](
        status=StatusEnum.SUCCESS, data=data
    )


@router.get(
    "/organizations/{organization_reference}/end_users/{end_user_reference}/examination_reports/{examination_report_reference}/files",
    tags=["examination_report"],
    dependencies=[
        Depends(internal_user_login_required),
        Depends(internal_user_identifier_keys_required({"EMR_READER"})),
    ],
    response_model=ResponseSchema[EnhancedViewSchema[List[RetrieveFileSummarySchema]]],
)
async def get_end_user_examination_report_files(
    organization_reference: Reference,
    end_user_reference: Reference,
    examination_report_reference: Reference,
    page_context=Depends(file_page_view_enhancer.get_context),
    bus: MessageBus = Depends(get_message_bus),
):
    data = await examination_report_views.get_examination_report_files_by_load_and_filter_and_page(
        bus.uow,
        ViewEnhancement(
            enhancer=emr_load_view_enhancer,
            context=LoadContextSchema(type=EMRLoadEnum.FILE.value),
        ),
        ViewEnhancement(
            enhancer=file_filter_view_enhancer,
            context=FilterContextSchema(
                type=FileFilterEnum.EXAMINATION_REPORT_REFERENCE.value,
                query=examination_report_reference,
            ),
        ),
        ViewEnhancement(enhancer=file_page_view_enhancer, context=page_context),
    )
    return ResponseSchema[EnhancedViewSchema[List[RetrieveFileSummarySchema]]](
        status=StatusEnum.SUCCESS, data=data
    )


@router.get(
    "/end_users/me/examination_reports/{examination_report_reference}/files/{file_reference}",
    tags=["examination_report"],
    dependencies=[Depends(end_user_login_required)],
    response_model=ResponseSchema[EnhancedViewSchema[RetrieveFileDetailSchema]],
)
async def get_end_user_examination_report_file_detail(
    examination_report_reference: Reference,
    file_reference: Reference,
    bus: MessageBus = Depends(get_message_bus),
):
    data = (
        await examination_report_views.get_examination_report_file_by_load_and_filter(
            bus.uow,
            ViewEnhancement(
                enhancer=emr_load_view_enhancer,
                context=LoadContextSchema(type=EMRLoadEnum.FILE.value),
            ),
            ViewEnhancement(
                enhancer=file_filter_view_enhancer,
                context=FilterContextSchema(
                    type=FileFilterEnum.REFERENCE.value,
                    query=file_reference,
                ),
            ),
        )
    )
    return ResponseSchema[EnhancedViewSchema[RetrieveFileDetailSchema]](
        status=StatusEnum.SUCCESS, data=data
    )


@router.get(
    "/organizations/{organization_reference}/end_users/{end_user_reference}/examination_reports/{examination_report_reference}/files/{file_reference}",
    tags=["examination_report"],
    dependencies=[
        Depends(internal_user_login_required),
        Depends(internal_user_identifier_keys_required({"EMR_READER"})),
    ],
    response_model=ResponseSchema[EnhancedViewSchema[RetrieveFileDetailSchema]],
)
async def get_end_user_examination_report_file_detail(
    organization_reference: Reference,
    end_user_reference: Reference,
    examination_report_reference: Reference,
    file_reference: Reference,
    bus: MessageBus = Depends(get_message_bus),
):
    data = (
        await examination_report_views.get_examination_report_file_by_load_and_filter(
            bus.uow,
            ViewEnhancement(
                enhancer=emr_load_view_enhancer,
                context=LoadContextSchema(type=EMRLoadEnum.FILE.value),
            ),
            ViewEnhancement(
                enhancer=file_filter_view_enhancer,
                context=FilterContextSchema(
                    type=FileFilterEnum.REFERENCE.value,
                    query=file_reference,
                ),
            ),
        )
    )
    return ResponseSchema[EnhancedViewSchema[RetrieveFileDetailSchema]](
        status=StatusEnum.SUCCESS, data=data
    )


@router.delete(
    "/organizations/{organization_reference}/end_users/{end_user_reference}/examination_reports/{examination_report_reference}/files/{file_reference}",
    tags=["examination_report"],
    dependencies=[
        Depends(internal_user_login_required),
        Depends(internal_user_identifier_keys_required({"EMR_READER"})),
    ],
    response_model=ResponseSchema,
)
async def delete_examination_report_file(
    organization_reference: Reference,
    end_user_reference: Reference,
    examination_report_reference: Reference,
    file_reference: Reference,
    bus: MessageBus = Depends(get_message_bus),
):
    cmd = command.DeleteExaminationReportFile(reference=file_reference)
    await bus.handle(cmd)
    return ResponseSchema(status=StatusEnum.SUCCESS)


@router.delete(
    "/organizations/{organization_reference}/end_users/{end_user_reference}/examination_reports/{examination_report_reference}",
    tags=["examination_report"],
    dependencies=[
        Depends(internal_user_login_required),
        Depends(internal_user_identifier_keys_required({"EMR_READER"})),
    ],
    response_model=ResponseSchema,
)
async def delete_examination_report(
    organization_reference: Reference,
    end_user_reference: Reference,
    examination_report_reference: Reference,
    bus: MessageBus = Depends(get_message_bus),
):
    cmd = command.DeleteExaminationReport(reference=examination_report_reference)
    await bus.handle(cmd)
    return ResponseSchema(status=StatusEnum.SUCCESS)
