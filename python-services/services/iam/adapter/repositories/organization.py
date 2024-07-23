from modules.adapter.repository import SqlAlchemyRepository
from modules.domain.models.entity import Entity
from services.iam.domain.models.organization import Organization


class OrganizationRepository(SqlAlchemyRepository[Organization]):
    @property
    def _model(self) -> Entity:
        return Organization
