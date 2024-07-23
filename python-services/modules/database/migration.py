from __future__ import annotations

import glob
import os
import random
from contextlib import asynccontextmanager
from datetime import datetime
from types import ModuleType
from typing import Dict

from core.module import dynamic_import_by_file_path
from mako.template import Template
from modules.database.database import Database
from modules.database.models.data_version import DataVersion
from modules.database.sa.registry import mapper_registry
from modules.database.tables.data_version import data_version_table
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from alembic import command
from alembic.config import Config


class SchemaMigration:
    def __init__(self, database: Database, version_dir: str):
        self._db = database
        self._version_dir = version_dir
        self._alembic_cfg = self.create_alembic_config()

    def create_alembic_config(self) -> Config:
        # https://alembic.sqlalchemy.org/en/latest/api/config.html
        alembic_cfg = Config()
        alembic_cfg.set_main_option(
            "sqlalchemy.url",
            self._db.get_url(),
        )
        alembic_cfg.set_main_option("script_location", "./modules/database/alembic")
        alembic_cfg.set_main_option(
            "file_template",
            "%%(year)d_%%(month).2d_%%(day).2d_%%(hour).2d_%%(minute).2d_%%(second).2d_%%(rev)s",
        )
        version_location = self.get_version_location()
        if not os.path.exists(version_location):
            os.makedirs(version_location)
        alembic_cfg.set_main_option("version_locations", version_location)
        return alembic_cfg

    def get_version_location(self) -> str:
        return self._version_dir

    def generate_revision(self):
        script = command.revision(
            self._alembic_cfg,
            autogenerate=True,
        )
        if isinstance(script, list):
            script = script[0]

    def upgrade(self, revision: str = "head"):
        print("Upgrade Start", flush=True)
        command.upgrade(self._alembic_cfg, revision)
        print("Upgrade Done", flush=True)

    def downgrade(self, revision: str = "-1"):
        print("Downgrade Start", flush=True)
        command.downgrade(self._alembic_cfg, revision)
        print("Downgrade Done", flush=True)


class DataMigration:
    class Operation:
        def __init__(self, session: AsyncSession):
            self._session = session

        @asynccontextmanager
        async def acquire_db_session(self):
            yield self._session

        @asynccontextmanager
        async def acquire_external_db_session(self, db: Database):
            async_session = db.get_async_session()
            async with async_session() as session:
                yield session

    class Revision:
        def __init__(self, version_number: str, module: ModuleType):
            self._version_number = version_number
            self._module = module
            self._down_revision = None
            self._up_revision = None

        def set_down_revision(self, down_revision: DataMigration.Revision = None):
            self._down_revision = down_revision

        def set_up_revision(self, up_revision: DataMigration.Revision = None):
            self._up_revision = up_revision

        def get_version_number(self) -> str:
            return self._version_number

        def get_down_revision(self) -> DataMigration.Revision | None:
            return self._down_revision

        def get_up_revision(self) -> DataMigration.Revision | None:
            return self._up_revision

        async def invoke_upgrade(self, operation: DataMigration.Operation):
            await self._module.upgrade(operation)

    def __init__(self, database: Database, version_dir: str):
        self._db = database
        self._version_dir = version_dir
        self._script_location = "./modules/database/data_migration"

    async def _create_version_table_if_not_exist(self):
        is_version_table_exist = await self._db.has_table(data_version_table.name)
        if is_version_table_exist:
            return
        async with self._db.async_engine.begin() as conn:
            await conn.run_sync(
                mapper_registry.metadata.create_all, tables=[data_version_table]
            )

    def _get_linked_revision_map(self) -> Dict[str, DataMigration.Revision]:
        revision_map: Dict[str, DataMigration.Revision] = {}
        down_revision_version_number_map: Dict[str, str] = {}
        revision_file_paths = glob.glob(os.path.join(self._version_dir, "*.py"))
        for revision_file_path in revision_file_paths:
            basename = os.path.basename(revision_file_path)
            module_name, _extension = basename.rsplit(".", 1)
            module = dynamic_import_by_file_path(
                f"data_revisions.{module_name}", revision_file_path
            )
            revision_map[module.revision] = DataMigration.Revision(
                module.revision, module
            )
            down_revision_version_number_map[module.revision] = module.down_revision
        for (
            revision_version_number,
            down_revision_version_number,
        ) in down_revision_version_number_map.items():
            revision = revision_map.get(revision_version_number, None)
            down_revision = revision_map.get(down_revision_version_number, None)
            if revision is None:
                raise Exception(f"Revision `{revision_version_number}` is not found")
            if down_revision_version_number is not None and down_revision is None:
                raise Exception(
                    f"Revision `{down_revision_version_number}` is not found"
                )
            revision.set_down_revision(down_revision)
            if down_revision_version_number is not None:
                down_revision.set_up_revision(revision)
        return revision_map

    async def _get_current_version_number(self) -> str | None:
        async_session = self._db.get_async_session()
        async with async_session() as session:
            statement = select(data_version_table.columns.version_num)
            result = await session.execute(statement)
            version_num = result.scalars().first()
            return version_num

    def _generate_revision_file_name(self, version_number: str) -> str:
        local_now = datetime.now()
        datetime_str = datetime.strftime(local_now, "%Y_%m_%d_%H_%M_%S")
        return f"{datetime_str}_{version_number}.py"

    async def generate_revision(self):
        await self._create_version_table_if_not_exist()
        revision_map = self._get_linked_revision_map()
        current_version_number = await self._get_current_version_number()

        if current_version_number is None and len(revision_map) > 0:
            raise Exception(
                "Your data version is not up to date. Please upgrade first."
            )
        if (
            current_version_number is not None
            and revision_map[current_version_number].get_up_revision() is not None
        ):
            raise Exception(
                "Your data version is not up to date. Please upgrade first."
            )

        up_version_number = "".join(
            random.choice("0123456789abcdef") for _ in range(12)
        )
        template = Template(
            filename=os.path.join(self._script_location, "script.py.mako")
        )
        rendered_content = template.render(
            up_revision=up_version_number, down_revision=current_version_number
        )
        file_path = os.path.join(
            self._version_dir, self._generate_revision_file_name(up_version_number)
        )
        with open(file_path, "w") as fd:
            fd.write(rendered_content)
        print(f"SCRIPT PATH: {file_path}", flush=True)

    async def upgrade(self):
        print("Upgrade Start", flush=True)
        await self._create_version_table_if_not_exist()
        revision_map = self._get_linked_revision_map()
        current_version_number = await self._get_current_version_number()
        if current_version_number is None:
            iterating_revision = next(
                (
                    rev
                    for rev in revision_map.values()
                    if rev.get_down_revision() is None
                ),
                None,
            )
        else:
            iterating_revision = revision_map[current_version_number].get_up_revision()

        async_session = self._db.get_async_session()
        async with async_session() as session:
            operation = DataMigration.Operation(session)
            target_version_number = current_version_number
            while iterating_revision is not None:
                await iterating_revision.invoke_upgrade(operation)
                target_version_number = iterating_revision.get_version_number()
                iterating_revision = iterating_revision.get_up_revision()

            if current_version_number is None:
                data_version = DataVersion(version_num=target_version_number)
                session.add(data_version)
            else:
                statement = (
                    update(DataVersion)
                    .where(DataVersion.version_num == current_version_number)
                    .values(version_num=target_version_number)
                )
                await session.execute(statement)
            await session.commit()
        print("Upgrade Done", flush=True)
