from datetime import date, datetime, time
from decimal import Decimal
from typing import NewType

from pydantic import UUID4

Reference = NewType("Reference", UUID4)
DataAlias = NewType("DataAlias", str)
DateTime = NewType("DateTime", datetime)
Date = NewType("Date", date)
Time = NewType("Date", time)
Decimal = Decimal
Comparable = bool | str | int | float | Decimal | Reference | DateTime | Date


def cast_string_to_date(s: str) -> Date:
    return datetime.strptime(s, "%Y-%m-%d").date()


def cast_string_to_datetime(s: str) -> DateTime:
    if "." in s:
        return datetime.strptime(s, "%Y-%m-%dT%H:%M:%S.%fZ")
    else:
        return datetime.strptime(s, "%Y-%m-%dT%H:%M:%S")


def cast_date_to_string(d: Date) -> str:
    return datetime.strftime(d, "%Y-%m-%d")


def cast_datetime_to_string(dt: DateTime) -> str:
    return datetime.strftime(dt, "%Y-%m-%dT%H:%M:%S.%fZ")
