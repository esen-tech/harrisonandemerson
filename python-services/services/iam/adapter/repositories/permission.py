from typing import Type

from modules.adapter.repository import SqlAlchemyRepository
from services.iam.domain.models.permission import Permission


class PermissionRepository(SqlAlchemyRepository[Permission]):
    @property
    def _model(self) -> Type[Permission]:
        return Permission
