import psycopg2


class DB:
    def __init__(self, **kwargs):
        self.conn = psycopg2.connect(**kwargs)

    def __del__(self):
        self.conn.close()
