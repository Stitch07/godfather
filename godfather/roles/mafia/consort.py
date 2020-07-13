from godfather.roles.town.escort import Escort
from godfather.roles.mixins import MafiaMember


class Consort(MafiaMember, Escort):
    name = 'Consort'
