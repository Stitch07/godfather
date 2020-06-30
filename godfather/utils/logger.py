import logging
from logging import Formatter, StreamHandler, FileHandler

colors = dict([
    [logging.ERROR, 91],
    [logging.WARNING, 93],
    [logging.INFO, 94],
    [logging.DEBUG, 95]
])

FMT = '[%(asctime)s] %(levelname)s %(message)s'
DATEFMT = '%Y-%m-%d %H:%M:%S'


class ColoredFormatter(Formatter):
    def __init__(self):
        self.reset = '\033[0m'
        super().__init__(fmt=FMT, datefmt=DATEFMT)

    def format(self, record):
        msg = super().format(record)
        prefix = '\033[{}m'.format(colors.get(record.levelno))
        return prefix + msg + self.reset


# colored console logging
terminal_handler = StreamHandler()
terminal_handler.setLevel(logging.DEBUG)
terminal_handler.setFormatter(ColoredFormatter())


def getlogger(config=None):
    logger = logging.getLogger('godfather')

    if 'file' in config:
        file_handler = FileHandler(config['file'])
        file_handler.setFormatter(Formatter(fmt=FMT, datefmt=DATEFMT))
        logger.addHandler(file_handler)
    else:
        logger.addHandler(terminal_handler)
        logger.setLevel(logging.DEBUG)

    return logger
