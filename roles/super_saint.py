from .role import Role

description = 'You will blow up the last person to lynch you!'

class SuperSaint(Role):
    def __init__(self):
        super().__init__(name='Super Saint', id='super_saint', description=description)

    def on_lynch(self, game):
        # wip; kill the last person to lynch them
        pass
