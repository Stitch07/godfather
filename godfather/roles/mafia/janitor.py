from godfather.roles.mixins import SingleAction, MafiaMember
from godfather.game.types import Priority

DESCRIPTION = 'You may clean a player at night.'


class Janitor(MafiaMember, SingleAction):
    name = 'Janitor'
    description = DESCRIPTION

    def __init__(self):
        super().__init__()
        self.action = 'clean'
        self.action_gerund = 'cleaning'
        self.action_priority = Priority.JANITOR
        self.action_text = 'clean a player'

    async def run_action(self, actions, player, target):
        record = actions.record[target.user.id]['nightkill']
        if record['result']:
            target.role.cleaned = True

    async def tear_down(self, actions, player, target):
        record = actions.record[target.user.id]['nightkill']
        if record['result']:
            await player.user.send('You secretly know that your target\'s role was {}.'.format(target.role.name))
