from godfather.roles.base import Role
from godfather.roles import all_roles
from godfather.factions import ExecutionerNeutral

DESCRIPTION = 'You must get your target lynched by all means necessary.'


class Executioner(Role):
    """
    An obsessed lyncher who will execute his target by any means.

    - Win condition: Trick and influence the town into lynching your target.

    + Abilities: At the beginning of each game you will be given a target, who you need to get executed by any means.
    """
    name = 'Executioner'
    description = DESCRIPTION

    def __init__(self):
        super().__init__()
        self.target = None
        self.faction = ExecutionerNeutral()
        self.categories.append('Neutral Evil')
