from modules.database.sa.metadata import get_metadata
from sqlalchemy.orm import registry

mapper_registry = registry(metadata=get_metadata())
