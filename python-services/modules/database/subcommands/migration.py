import click
from core.command import cli
from core.decorator import coro
from modules.database.config import get_config
from modules.database.database import Database
from modules.database.migration import DataMigration, SchemaMigration


@cli.group("schema-migration")
@click.argument("version-dir")
@click.pass_context
def schema_migration(ctx, version_dir: str):
    config = get_config()
    database = Database(config.DATABASE_URL, schema_name=config.SCHEMA_NAME)
    schema_migration = SchemaMigration(database, version_dir)
    ctx.obj["database"] = database
    ctx.obj["schema-migration"] = schema_migration


@schema_migration.command("generate-revision")
@click.pass_obj
def schema_migration_generate_revision(ctx):
    """
    Usage:
        python -m services.iam_api.command schema-migration <path/to/revisions> generate-revision
    """
    schema_migration: SchemaMigration = ctx["schema-migration"]
    schema_migration.generate_revision()


@schema_migration.command("upgrade")
@click.pass_obj
def schema_migration_upgrade(ctx):
    """
    Usage:
        python -m services.iam_api.command schema-migration <path/to/revisions> upgrade
    """
    schema_migration: SchemaMigration = ctx["schema-migration"]
    schema_migration.upgrade()


@schema_migration.command("downgrade")
@click.pass_obj
def schema_migration_downgrade(ctx):
    """
    Usage:
        python -m services.iam_api.command schema-migration <path/to/revisions> downgrade
    """
    schema_migration: SchemaMigration = ctx["schema-migration"]
    schema_migration.downgrade()


@cli.group("data-migration")
@click.argument("version-dir")
@click.pass_context
def data_migration(ctx, version_dir: str):
    config = get_config()
    database = Database(config.DATABASE_URL, schema_name=config.SCHEMA_NAME)
    data_migration = DataMigration(database, version_dir)
    ctx.obj["data-migration"] = data_migration


@data_migration.command("generate-revision")
@click.pass_obj
def data_migration_generate_revision(ctx):
    """
    Usage:
        python -m services.iam_api.command data-migration <path/to/revisions> generate-revision
    """
    data_migration: DataMigration = ctx["data-migration"]
    coro(data_migration.generate_revision)()


@data_migration.command("upgrade")
@click.pass_obj
def data_migration_upgrade(ctx):
    """
    Usage:
        python -m services.iam_api.command data-migration <path/to/revisions> upgrade
    """
    data_migration: DataMigration = ctx["data-migration"]
    coro(data_migration.upgrade)()
