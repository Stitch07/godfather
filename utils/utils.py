from datetime import datetime

# General utilities


def pluralize(value: int):
    return 's' if value > 1 else ''


def from_now(t1: datetime):
    now = datetime.now()
    delta = t1 - now if t1 > now else now - t1
    result = ''
    if t1 > now:
        result += 'in '
    if delta.seconds / 60 > 1:
        min_left = round(delta.seconds / 60)
        result += f'{min_left} minute{pluralize(min_left)}'
    else:
        result += f'{delta.seconds} second{pluralize(delta.seconds)}'
    if t1 < now:
        result += ' ago'

    return result


def mixin(cls1, cls2):
    insp
