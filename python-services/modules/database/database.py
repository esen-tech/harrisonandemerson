from modules.database.sa.metadata import get_metadata
from sqlalchemy import inspect
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.schema import CreateSchema, DropSchema, MetaData


class Database:
    @staticmethod
    def get_schema_names(conn):
        inspector = inspect(conn)
        return inspector.get_schema_names()

    def __init__(self, url: str, schema_name: str = None):
        self._url = url
        self.schema_name = schema_name
        self.async_engine = create_async_engine(
            url,
            isolation_level="READ COMMITTED",
            future=True,
        )
        self.metadata = get_metadata()

    def get_url(self) -> str:
        return self._url

    def get_async_session(self):
        async_session_factory = sessionmaker(self.async_engine, class_=AsyncSession)
        return async_session_factory

    async def reflect_metadata(self):
        self.metadata = MetaData(schema=self.schema_name)
        async with self.async_engine.begin() as conn:
            await conn.run_sync(self.metadata.reflect)

    async def has_table(self, tablename: str) -> bool:
        def _has_table(conn):
            inspector = inspect(conn)
            return inspector.has_table(tablename)

        async with self.async_engine.begin() as conn:
            r = await conn.run_sync(_has_table)
            return r

    async def reset_schema(self):
        async with self.async_engine.begin() as conn:
            schema_names = await conn.run_sync(self.get_schema_names)
            if self.schema_name in schema_names:
                await self.drop_tables()
                await self.drop_schema()
        await self.create_schema()

    async def drop_schema(self):
        async with self.async_engine.begin() as conn:
            await conn.execute(DropSchema(self.schema_name))

    async def drop_tables(self):
        reflected_metadata = MetaData(schema=self.schema_name)
        async with self.async_engine.begin() as conn:
            await conn.run_sync(reflected_metadata.reflect)
            await conn.run_sync(reflected_metadata.drop_all)

    async def create_schema(self):
        async with self.async_engine.begin() as conn:
            await conn.execute(CreateSchema(self.schema_name))
