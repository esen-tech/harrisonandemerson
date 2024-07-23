import hashlib
import re
from typing import Tuple

from pydantic import BaseModel


def get_hashed_password(password: str, salt: str) -> str:
    return hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100000).hex()


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
