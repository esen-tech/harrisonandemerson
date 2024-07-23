from modules.adapter.repository import SqlAlchemyRepository
from modules.domain.models.entity import Entity
from services.emr.domain.models.file import File


class FileRepository(SqlAlchemyRepository[File]):
    @property
    def _model(self) -> Entity:
        return File
