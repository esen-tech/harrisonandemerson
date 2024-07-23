from sqlalchemy import (
    JSON,
    Boolean,
    Date,
    DateTime,
    Float,
    Integer,
    Numeric,
    String,
    Text,
    Time,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm.properties import ColumnProperty

Boolean = Boolean
Integer = Integer
Float = Float
Numeric = Numeric
Date = Date
Time = Time
DateTime = DateTime
String = String
Text = Text
JSON = JSON
Reference = UUID(as_uuid=True)


def is_date_column(column: ColumnProperty):
    return isinstance(column.type, Date)


def is_datetime_column(column: ColumnProperty):
    return isinstance(column.type, DateTime)
