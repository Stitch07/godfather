from godfather.roles.base import Role
from godfather.roles.mixins import Townie

DESCRIPTION = 'You have no powers.'


class Vanilla(Townie, Role):
    """
    A regular townie without any powers.

    - Win Condition: Lynch every criminal and evildoer
    """
    name = 'Vanilla'
    description = DESCRIPTION
