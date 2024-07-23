import asyncio
from functools import wraps


def coro(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        # Don't use `asyncio.run(f(*args, **kwargs))` here since it always create a new event loop.
        # See more on https://cloud.tencent.com/developer/article/1598240
        loop = asyncio.get_event_loop()
        result = loop.run_until_complete(f(*args, **kwargs))
        return result

    return wrapper
