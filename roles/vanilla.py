from .role import Role

DESCRIPTION = 'You have no powers.'


class Vanilla(Role):
    def __init__(self):
        super().__init__(name='Vanilla', role_id='vanilla', description=DESCRIPTION)
