from godfather.game.types import Defense
from godfather.roles import all_roles


class Role:
    name = ''
    description = ''
    unique = False

    def __init__(self, *args, **kwargs):
        self.cleaned = False
        self.categories = []
        super().__init__(*args, **kwargs)

    async def on_death(self, game, player):
        # exe only attacks townies
        if not player.role.faction.name == 'Town':
            return
        for exe in game.players.filter(role='Executioner', is_alive=True):
            if (exe.target == player and not
                exe.target.death_reason.startswith('lynched')):
                await exe.user.send('Your target has died. You are now a Jester!')
                Jester = all_roles['Jester']
                exe.role = Jester()
                await exe.user.send(exe.role_pm)

    # str representation of role
    def __str__(self):
        return self.name

    def can_do_action(self, _game):
        return False, ''

    def display_role(self):
        if self.cleaned:
            return 'Cleaned'
        return self.name

    # called when a player is lynched. takes the game object, and the player lynched
    async def on_lynch(self, game, player):
        pass

    def defense(self) -> Defense:
        return Defense.NONE
