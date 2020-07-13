from godfather.game.types import Defense


class Role:
    name = ''
    description = ''

    # str representation of role
    def __str__(self):
        return self.name

    def can_do_action(self, _game):
        return False, ''

    def display_role(self):
        return self.name

    # called when a player is lynched. takes the game object, and the player lynched
    async def on_lynch(self, game, player):
        pass

    def defense(self) -> Defense:
        return Defense.NONE