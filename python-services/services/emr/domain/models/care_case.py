from dataclasses import dataclass
from enum import Enum
from typing import List

from modules.domain.models.entity import Entity
from modules.domain.types import DateTime, Reference
from services.emr.domain.models.care_case_review import CareCaseReview


@dataclass(kw_only=True)
class CareCase(Entity):
    class StateEnum(Enum):
        CREATED = "CREATED"
        ONBOARD = "ONBOARD"

    subject_end_user_reference: Reference
    assignee_internal_user_reference: Reference
    ecpay_order_id: str
    state: StateEnum
    onboard_time: DateTime | None = None
    effective_time: DateTime | None = None
    close_time: DateTime | None = None
    care_plan: str | None = None
    closing_summary: str | None = None
    care_airtable_reference: str | None = None
    total_appointment_inventory_count_for_doctor: int
    allocated_appointment_inventory_count_for_doctor: int
    total_appointment_inventory_count_for_care_manager: int
    allocated_appointment_inventory_count_for_care_manager: int
    care_case_reviews: List[CareCaseReview]
