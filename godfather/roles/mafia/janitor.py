from godfather.roles.mixins import SingleAction, MafiaMember
from godfather.game.types import Priority

DESCRIPTION = 'You may clean a player at night.'


class Janitor(MafiaMember, SingleAction):
    """
    A sanitisation expert working for organised crime.

    - Win condition: Kill anyone who will not submit to the mafia.

    + Abilities: Choose a target who will be potentially killed by mafia.
    + If your target dies, their role will not be revealed to anyone except you.
    + You can only perform 3 cleanings in a game.
    """
    name = 'Janitor'
    description = DESCRIPTION

    def __init__(self):
        super().__init__()
        self.action = 'clean'
        self.action_gerund = 'cleaning'
        self.action_priority = Priority.JANITOR
        self.action_text = 'clean a player'
        self.categories.append('Mafia Deception')

    async def run_action(self, actions, player, target):
        record = actions.record[target.user.id]['nightkill']
        if record['result']:
            target.role.cleaned = True

    async def tear_down(self, actions, player, target):
        record = actions.record[target.user.id]['nightkill']
        if record['result']:
            await player.user.send('You secretly know that your target\'s role was {}.'.format(target.role.name))
