from collections import defaultdict


def default_key():
    return defaultdict(lambda: {'result': False, 'by': []})


night_record = defaultdict(default_key)
