from __future__ import annotations

import abc


class AbstractUnitOfWork(abc.ABC):
    async def __aenter__(self) -> AbstractUnitOfWork:
        return self

    async def __aexit__(self, *args):
        await self.rollback()

    async def commit(self):
        await self._commit()

    @abc.abstractmethod
    async def _commit(self):
        raise NotImplementedError

    @abc.abstractmethod
    async def rollback(self):
        raise NotImplementedError


class VoidUnitOfWork(AbstractUnitOfWork):
    async def __aenter__(self) -> VoidUnitOfWork:
        await super().__aenter__()
        return self

    async def __aexit__(self, *args):
        await super().__aexit__(*args)

    async def _commit(self):
        pass

    async def rollback(self):
        pass
