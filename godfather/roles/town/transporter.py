from godfather.roles.mixins import Townie, DoubleTarget
from godfather.game.types import Priority

DESCRIPTION = 'You may transport 2 people every night, swapping all targets on them.'


class Transporter(Townie, DoubleTarget):
    name = 'Transporter'
    description = DESCRIPTION

    def __init__(self):
        super().__init__()
        self.can_block = False
        self.can_transport = False
        self.can_self_target = True
        self.action = 'transport'
        self.action_gerund = 'transporting'
        self.action_priority = Priority.TRANSPORTER
        self.action_text = 'transport 2 players'
        self.categories.append('Town Support')

    async def set_up(self, actions, _player, target):
        target1, target2 = target
        for action in actions:
            if action['target'] == target1:
                action['target'] = target2
            elif action['target'] == target2:
                action['target'] = target1

    async def tear_down(self, _actions, _player, target):
        for individual in target:
            await individual.user.send('You were transported to another location.')
