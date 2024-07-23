from core.command import cli
from modules.database import subcommands
from modules.database.orm import start_mappers as start_database_mappers
from services.marketing.database import tables
from services.marketing.database.orm import (
    start_mappers as start_service_database_mappers,
)

if __name__ == "__main__":
    start_database_mappers()
    start_service_database_mappers()
    cli()
