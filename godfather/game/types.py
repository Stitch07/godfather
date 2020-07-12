from collections import defaultdict
from enum import IntEnum, auto


def default_key():
    return defaultdict(lambda: {'result': False, 'by': []})


night_record = defaultdict(default_key)


class Defense(IntEnum):
    NONE = auto()
    BASIC = auto()
    POWERFUL = auto()
    UNSTOPPABLE = auto()
