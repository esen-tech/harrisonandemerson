import hashlib
from typing import IO


def get_md5_hash(file: IO, block_size_in_byte: int = 8192) -> str:
    md5_hash = hashlib.md5()
    while chunk := file.read(block_size_in_byte):
        md5_hash.update(chunk)
    file.seek(0)
    return md5_hash.hexdigest()
