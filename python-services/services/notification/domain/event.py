from dataclasses import dataclass

from modules.domain.event import Event


@dataclass
class EndUserSignupIntentCreated(Event):
    phone_number: str | None
    email_address: str | None
    otp_value: str


@dataclass
class EndUserLoginIntentCreated(Event):
    phone_number: str | None
    email_address: str | None
    otp_value: str


external_events = [EndUserSignupIntentCreated, EndUserLoginIntentCreated]
