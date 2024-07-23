from typing import Any

from fastapi import Query
from pydantic import Json
from sqlalchemy.sql import expression

from modules.domain.views.view_enhancer import (
    EnhanceContext,
    EnhanceMetadata,
    ViewEnhancer,
)


class FilterContextSchema(EnhanceContext):
    type: str | None = None
    query: Any | None = None


class FilterMetadataSchema(EnhanceMetadata):
    pass


class FilterViewEnhancer(
    ViewEnhancer[expression.select, FilterContextSchema, FilterMetadataSchema]
):
    def __init__(self, type_enum):
        self._type_enum = type_enum
        self._handler_map = {}

    def get_context(self, filter: Json = Query(default=None)) -> FilterContextSchema:
        if filter is None:
            return FilterContextSchema()
        else:
            return FilterContextSchema(**filter)

    def enhance(
        self, statement: expression.select, filter_context: FilterContextSchema = None
    ) -> expression.select:
        handler = self._handler_map.get(filter_context.type)
        if (
            handler is None
            or filter_context.query is None
            or filter_context.query == ""
        ):
            return statement
        statement = handler(statement, filter_context)
        return statement

    def handler(self, type):
        def decorator(func):
            self._handler_map[type.value] = func

        return decorator
