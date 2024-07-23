from dataclasses import dataclass

from modules.domain.models.entity import Entity
from modules.domain.types import Reference


@dataclass(kw_only=True)
class OrganizationOrganization(Entity):
    upstream_organization_reference: Reference
    downstream_organization_reference: Reference
