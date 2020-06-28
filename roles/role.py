class Role:
    def __init__(self, name=None, role_id=None, description=''):
        self.name = name
        self.role_id = role_id
        self.description = description
        super().__init__()

    # str representation of role
    def __str__(self):
        return self.name

    def can_do_action(self, game):
        return False, ''

    def display_role(self):
        return self.name

    # called when a player is lynched. takes the game object, and the player lynched
    async def on_lynch(self, game, player):
        pass
