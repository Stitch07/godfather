from godfather.roles.escort import Escort


class Consort(Escort):
    def __init__(self):
        super().__init__()
        self.name = 'Consort'
        self.role_id = 'consort'
