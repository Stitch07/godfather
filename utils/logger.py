import logging
from logging import Formatter, StreamHandler, FileHandler

DEFAULT_CONFIG = dict()

colors = dict([
    [logging.ERROR, 91],
    [logging.WARNING, 93],
    [logging.INFO, 94],
    [logging.DEBUG, 95]
])

fmt = '[%(asctime)s] %(levelname)s %(message)s'
datefmt = '%Y-%m-%d %H:%M:%S'


class ColoredFormatter(Formatter):
    def __init__(self):
        self.reset = '\033[0m'
        super().__init__(fmt=fmt, datefmt=datefmt)

    def format(self, record):
        msg = super().format(record)
        prefix = '\033[{}m'.format(colors.get(record.levelno))
        return prefix + msg + self.reset


# colored console logging
terminal_handler = StreamHandler()
terminal_handler.setLevel(logging.DEBUG)
terminal_handler.setFormatter(ColoredFormatter())


def getlogger(config=DEFAULT_CONFIG):
    logger = logging.getLogger('godfather')

    if 'file' in config:
        fh = FileHandler(config['file'])
        fh.setFormatter(Formatter(fmt=fmt, datefmt=datefmt))
        logger.addHandler(fh)
    else:
        logger.addHandler(terminal_handler)
        logger.setLevel(logging.DEBUG)

    return logger
