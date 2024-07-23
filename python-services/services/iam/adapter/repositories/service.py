from typing import Type

from modules.adapter.repository import SqlAlchemyRepository
from services.iam.domain.models.service import Service


class ServiceRepository(SqlAlchemyRepository[Service]):
    @property
    def _model(self) -> Type[Service]:
        return Service
