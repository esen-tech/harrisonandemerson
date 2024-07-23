from modules.database.models.data_version import DataVersion
from modules.database.sa.registry import mapper_registry
from modules.database.tables.data_version import data_version_table


def start_mappers():
    mapper_registry.map_imperatively(DataVersion, data_version_table)
