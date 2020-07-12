from godfather.roles.base import Role
from godfather.roles.mixins import Townie

DESCRIPTION = 'You have no powers.'


class Vanilla(Townie, Role):
    def __init__(self):
        super().__init__(name='Vanilla', role_id='vanilla', description=DESCRIPTION)
