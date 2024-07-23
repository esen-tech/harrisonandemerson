from core.config import get_config
from fastapi import APIRouter
from modules.web_server.schemas.server import ResponseSchema, StatusEnum
from modules.web_server.schemas.system import InspectSchema, LivenessSchema

router = APIRouter()


@router.get("/", tags=["system"], response_model=ResponseSchema[LivenessSchema])
def get_liveness():
    return ResponseSchema[LivenessSchema](status=StatusEnum.SUCCESS)


@router.get("/inspect", tags=["system"], response_model=ResponseSchema[InspectSchema])
def get_inspect():
    config = get_config()
    return ResponseSchema[InspectSchema](
        status=StatusEnum.SUCCESS, data=InspectSchema(config=config)
    )
