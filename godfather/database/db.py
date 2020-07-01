import logging
import psycopg2

logger = logging.getLogger('godfather')


class DB:
    # pylint: disable=too-few-public-methods
    def __init__(self, **kwargs):
        try:
            self.conn = psycopg2.connect(**kwargs)
            logger.debug('PostgreSQL connected successfully.')
        except psycopg2.OperationalError as err:
            logger.error("Couldn't connect to PostgreSQL: %s", err)

    def __del__(self):
        self.conn.close()
