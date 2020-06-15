from .role import Role

description = 'You have no powers.'

class Vanilla(Role):
    def __init__(self):
        super().__init__(name='Vanilla', id='vanilla', description=description)
