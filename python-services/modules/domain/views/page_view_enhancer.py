import base64
import json
from enum import Enum
from operator import and_
from typing import List, Tuple

from fastapi import Query
from modules.database.sa.types import is_date_column, is_datetime_column
from modules.domain.models.entity import Entity
from modules.domain.types import (
    Comparable,
    cast_date_to_string,
    cast_datetime_to_string,
    cast_string_to_date,
    cast_string_to_datetime,
)
from modules.domain.views.view_enhancer import (
    EnhanceContext,
    EnhanceMetadata,
    ViewEnhancer,
)
from sqlalchemy import and_, or_
from sqlalchemy.orm.properties import ColumnProperty
from sqlalchemy.sql import expression


class DirectionEnum(Enum):
    ASC = "asc"
    DESC = "desc"


class PageContextSchema(EnhanceContext):
    count_per_page: int
    directions: List[DirectionEnum]
    cursor_values: List[Comparable | None]

    class Config:
        use_enum_values = True


class PageMetadataSchema(EnhanceMetadata):
    count_all_page: int
    count_per_page: int
    next_page_token: str | None


class PageViewEnhancer(
    ViewEnhancer[expression.select, PageContextSchema, PageMetadataSchema]
):
    def __init__(
        self,
        orders: List[Tuple[ColumnProperty, DirectionEnum]],
        page_size: int = 20,
    ) -> None:
        self._orders = orders
        self._page_size = page_size

    def get_context(
        self,
        count_per_page: int | None = Query(default=None),
        page_token: str | None = Query(default=None),
    ) -> PageContextSchema:
        if page_token is None:
            page_context = PageContextSchema(
                count_per_page=count_per_page or self._page_size,
                directions=[direction for (_, direction) in self._orders],
                cursor_values=[None for _ in self._orders],
            )
        else:
            page_context_dict = json.loads(base64.b64decode(page_token))
            cursor_values = []
            for (column, _), cursor_value in zip(
                self._orders, page_context_dict["cursor_values"]
            ):
                if is_date_column(column):
                    cursor_value = cast_string_to_date(cursor_value)
                elif is_datetime_column(column):
                    cursor_value = cast_string_to_datetime(cursor_value)
                cursor_values.append(cursor_value)
            page_context_dict["cursor_values"] = cursor_values
            page_context = PageContextSchema(**page_context_dict)

        return page_context

    def enhance(
        self, statement: expression.select, page_context: PageContextSchema
    ) -> expression.select:
        # https://stackoverflow.com/questions/38017054/mysql-cursor-based-pagination-with-multiple-columns
        visited_columns = []
        visited_cursor_values = []
        directed_columns = []
        partial_criteria = []
        for (column, _), cursor_value, direction in zip(
            self._orders, page_context.cursor_values, page_context.directions
        ):
            if direction == DirectionEnum.ASC.value:
                if cursor_value is not None:
                    partial_criteria.append(
                        and_(
                            *[
                                vc == vcv
                                for vc, vcv in zip(
                                    visited_columns, visited_cursor_values
                                )
                            ],
                            column > cursor_value
                        )
                    )
                    visited_columns.append(column)
                    visited_cursor_values.append(cursor_value)
                directed_columns.append(column.asc())
            elif direction == DirectionEnum.DESC.value:
                if cursor_value is not None:
                    partial_criteria.append(
                        and_(
                            *[
                                vc == vcv
                                for vc, vcv in zip(
                                    visited_columns, visited_cursor_values
                                )
                            ],
                            column < cursor_value
                        )
                    )
                    visited_columns.append(column)
                    visited_cursor_values.append(cursor_value)
                directed_columns.append(column.desc())

        statement = (
            statement.where(or_(*partial_criteria))
            .order_by(*directed_columns)
            .limit(self._page_size)
        )
        return statement

    def get_metadata(
        self,
        context: PageContextSchema,
        enhanced_entities: List[Entity] = None,
        count_all_page: int = None,
    ) -> PageMetadataSchema:
        if len(enhanced_entities) < context.count_per_page:
            return PageMetadataSchema(
                count_all_page=count_all_page,
                count_per_page=context.count_per_page,
                next_page_token=None,
            )
        else:
            last_entity = enhanced_entities[-1]
            cursor_values = []
            for (column, _) in self._orders:
                cursor_value = getattr(last_entity, column.key)
                if is_date_column(column):
                    cursor_value = cast_date_to_string(cursor_value)
                elif is_datetime_column(column):
                    cursor_value = cast_datetime_to_string(cursor_value)
                cursor_values.append(cursor_value)
            next_page_context = PageContextSchema(
                count_per_page=context.count_per_page,
                directions=context.directions,
                cursor_values=cursor_values,
            )
            next_page_token = self.get_page_token(next_page_context)
            return PageMetadataSchema(
                count_all_page=count_all_page or context.count_all_page,
                count_per_page=context.count_per_page,
                next_page_token=next_page_token,
            )

    def get_page_token(self, page_context: PageContextSchema) -> str:
        return base64.b64encode(json.dumps(page_context.dict()).encode("UTF-8"))
