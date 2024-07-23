from enum import Enum


class StringSizeEnum(int, Enum):
    XS = 32
    S = 128
    M = 256
    L = 1024
