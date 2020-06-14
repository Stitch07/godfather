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

    def remove(self, key: str):
        if not self.has(key):
            raise KeyError(key)
        os.remove(f'database/data/{key}.json')

    def update(self, key: str, data):
        self.update(key, data)

    def __setitem__(self, key: str, item):
        self.set(key, item)

    def __getitem__(self, key: str):
        return self.get(key)

    def __delitem__(self, key: str):
        self.remove(key)