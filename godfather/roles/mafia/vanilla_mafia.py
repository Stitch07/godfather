from godfather.roles.base import Role
from godfather.roles.mixins import MafiaMember

DESCRIPTION = 'You have no powers.'


class VanillaMafia(MafiaMember, Role):
    """
    A regular mafia without any special powers.

    - Win Condition: Kill anyone who will not submit to the mafia.

    + Abilities:
    + If the Goon dies, you will be given the final say over nightkill selection.
    """
    name = 'Vanilla Mafia'
    description = DESCRIPTION
