from godfather.roles.base import Role
from godfather.roles.mixins import Townie

DESCRIPTION = 'You have no powers.'


class Vanilla(Townie, Role):
    name = 'Vanilla'
    description = DESCRIPTION
