from dataclasses import dataclass
from enum import Enum

from modules.domain.models.entity import Entity
from services.emr.domain.models.file_group import FileGroup


@dataclass(kw_only=True)
class File(Entity):
    class ContentTypeEnum(Enum):
        APPLICATION_PDF = "application/pdf"
        IMAGE_JPEG = "image/jpeg"
        IMAGE_PNG = "image/png"
        VIDEO_MP4 = "video/mp4"

    file_group: FileGroup
    hash: str
    display_name: str
    raw_name: str
    content_type: ContentTypeEnum
    size_in_byte: int
