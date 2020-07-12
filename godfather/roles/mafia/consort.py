from godfather.roles.town.escort import Escort
from godfather.roles.mixins import MafiaMember


class Consort(MafiaMember, Escort):
    def __init__(self):
        super().__init__()
        self.name = 'Consort'
        self.role_id = 'consort'
