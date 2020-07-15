from godfather.roles.town.escort import Escort
from godfather.roles.mixins import MafiaMember


class Consort(MafiaMember, Escort):
    """
    A beautiful bar dancer now working for organised crime.

    - Win Condition: Kill anyone who will not submit to the Mafia.

    + Abilities: Choose one person each night to block them from using their role’s night ability. (roleblock)
    + If there are no mafia roles left who are capable of killing then you will become the goon.
    + You can talk with other mafia members.
    """
    name = 'Consort'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.categories.remove('Town Support')
        self.categories.remove('Random Town')
        self.categories.append('Mafia Support')
