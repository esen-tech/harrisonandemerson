from enum import Enum
from typing import Generic, TypeVar

from pydantic.generics import GenericModel

DataT = TypeVar("DataT")


class StatusEnum(int, Enum):
    SUCCESS = 0
    FAILED = 1


class ResponseSchema(GenericModel, Generic[DataT]):
    status: StatusEnum
    data: DataT | None
