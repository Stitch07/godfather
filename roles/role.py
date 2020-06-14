from game import Player

class Role:
    def __init__(self, name=None, id=None, description=''):
        self.name = name
        self.id = id
        self.description = description

    # called when a player is lynched
    def on_lynch(self, game):
        pass

    # generates the role's PM
    def get_role_pm(self, player: Player):
        return f'Hello {player.name}, you are a {player.faction} **{self.name}**. {self.description}'
