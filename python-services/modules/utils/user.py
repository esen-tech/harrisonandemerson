import re
from typing import Tuple

from pydantic import BaseModel


class PersonSchema(BaseModel):
    first_name: str | None
    last_name: str | None


def get_full_person_name(person: PersonSchema | None = None) -> str:
    if person is None:
        return ""

    first_name = "" if person.first_name is None else person.first_name
    last_name = "" if person.last_name is None else person.last_name

    if re.match(r"^[a-zA-Z]+$", first_name):
        return f"{first_name} {last_name}"
    else:
        return f"{last_name}{first_name}"


def split_name(full_name: str | None) -> Tuple[str, str]:
    first_name = ""
    last_name = ""
    if full_name is not None:
        full_name = full_name.strip()
        if full_name.count(" ") == 1:
            first_name, last_name = full_name.split(" ")
        elif full_name.count(" ") > 1:
            first_name = full_name
        elif re.match(r"^[a-zA-Z]+$", full_name):
            first_name = full_name
        else:
            first_name = full_name[1:]
            last_name = full_name[0]
    return first_name, last_name


def get_normalized_phone_number(phone_number: str) -> str:
    country_code = None
    identification_code = None
    digit_only_phone_number = "".join([c for c in phone_number if c.isdigit()])
    if len(digit_only_phone_number) == 10 and digit_only_phone_number[0:2] == "09":
        country_code = "+886"
        identification_code = digit_only_phone_number[1:]
    elif len(digit_only_phone_number) == 9 and digit_only_phone_number[0] == "9":
        country_code = "+886"
        identification_code = digit_only_phone_number
    elif len(digit_only_phone_number) == 12 and digit_only_phone_number[0:4] == "8869":
        country_code = "+886"
        identification_code = digit_only_phone_number[3:]
    elif len(digit_only_phone_number) == 13 and digit_only_phone_number[0:5] == "88609":
        country_code = "+886"
        identification_code = digit_only_phone_number[4:]

    if country_code is None or identification_code is None:
        return phone_number
    else:
        return f"{country_code}{identification_code}"
