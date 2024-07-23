import click
from core.command import cli
from core.decorator import coro
from modules.database.config import get_config
from modules.database.database import Database


@cli.group("db")
@click.pass_context
def db(ctx):
    config = get_config()
    database = Database(config.DATABASE_URL, schema_name=config.SCHEMA_NAME)
    ctx.obj["database"] = database


@db.command("reset-schema")
@click.pass_obj
def db_reset_schema(ctx):
    """
    Usage:
        python -m services.iam_api.command db reset-schema
    """
    database: Database = ctx["database"]
    coro(database.reset_schema)()
