from modules.domain.views.view_enhancer import (
    EnhanceContext,
    EnhanceMetadata,
    ViewEnhancer,
)
from sqlalchemy.sql import expression


class LoadContextSchema(EnhanceContext):
    type: str | None = None


class LoadMetadataSchema(EnhanceMetadata):
    pass


class LoadViewEnhancer(
    ViewEnhancer[expression.select, LoadContextSchema, LoadMetadataSchema]
):
    def __init__(self, type_enum):
        self._type_enum = type_enum
        self._handler_map = {}

    def get_context(self) -> LoadContextSchema:
        raise NotImplementedError

    def enhance(
        self, statement: expression.select, load_context: LoadContextSchema = None
    ) -> expression.select:
        handler = self._handler_map.get(load_context.type)
        if handler is None:
            return statement
        statement = handler(statement, load_context)
        return statement

    def handler(self, type):
        def decorator(func):
            self._handler_map[type.value] = func

        return decorator
