from dataclasses import dataclass

from modules.domain.event import Event


@dataclass(kw_only=True)
class AirtableExaminationReportCreated(Event):
    airtable_end_user_reference: str
