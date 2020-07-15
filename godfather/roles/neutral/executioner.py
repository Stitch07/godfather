from godfather.roles import Role
from godfather.roles import all_roles
from godfather.factions import ExecutionerNeutral

DESCRIPTION = 'You must get your target lynched by all means necessary.'


class Executioner(Role):
    """
    An obsessed lyncher who will execute his target by any means.

    - Win condition: Trick and influence the town into lynching your target.

    + Abilities: At the beginning of each game you will be given a target, who you need to get executed by any means.
    """
    name = 'Executioner'
    description = DESCRIPTION

    def __init__(self):
        super().__init__()
        self.target = None
        self.faction = ExecutionerNeutral()
        self.categories.append('Neutral Evil')

    async def on_death(self, game, player):
        # exe only attacks townies
        if not player.faction.name == 'Town':
            return
        for exe in game.players.filter(role='Executioner'):
            if exe.target == player:
                # exe becomes jester
                await exe.user.send('Your target has died. You are now a Jester!')
                Jester = all_roles['jester']
                exe.role = Jester()
                await exe.user.send(exe.role_pm)
