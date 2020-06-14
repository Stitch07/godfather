# atomic json database, loosely compatible with python maps
import os
from atomicwrites import atomic_write
import json

class DB:
    # atomically overwrites data/key.json
    def set(self, key: str, data):
        with atomic_write(f'database/data/{key}.json', overwrite=True) as f:
            json.dump(data, f)

    def has(self, key: str):
        return os.path.isfile(f'database/data/{key}.json')

    def get(self, key: str):
        if not self.has(key):
            raise KeyError(key)
        data = json.load(open(f'database/data/{key}.json'))
        return data

    def update(self, key: str, data):
        self.update(key, data)