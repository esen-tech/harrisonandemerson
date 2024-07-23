from dataclasses import dataclass


@dataclass(kw_only=True)
class AbstractPerson:
    first_name: str | None = None
    last_name: str | None = None
