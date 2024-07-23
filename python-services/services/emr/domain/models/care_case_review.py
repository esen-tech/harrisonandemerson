from dataclasses import dataclass

from modules.domain.models.entity import Entity
from modules.domain.types import DateTime, Reference


@dataclass(kw_only=True)
class CareCaseReview(Entity):
    care_manager_private_note: str | None = None
    display_subjective: str | None = None
    display_objective: str | None = None
    display_assessment: str | None = None
    display_plan: str | None = None
    care_airtable_reference: str | None = None
