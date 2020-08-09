class GameConfigException(Exception):
    pass


class GameConfig(dict):

    def __init__(self, default: dict = {}):
        super().__init__(**default)
        self.__resolvers__ = {}
        self.__messages__ = {}

    def add_key(self, item, resolver, message):
        self.__resolvers__[item] = resolver
        self.__messages__[item] = message

    def set(self, key, value):
        resolved = self.__resolvers__[key](value)
        super().__setitem__(key, resolved)
        return self.__messages__[key](key, resolved)
