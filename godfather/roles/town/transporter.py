from godfather.roles.mixins import Townie, DoubleTarget
from godfather.game.types import Priority

DESCRIPTION = 'You may transport 2 people every night, swapping all targets on them.'


class Transporter(Townie, DoubleTarget):
    """
    A  retired taxi driver who transports people without asking any questions.

    - Win Condition: Lynch every criminal and evildoer.


    + Abilities: Choose two people to transport at night.
    + Transporting two people will swap all targets against them.
    + You may transport yourself.
    + Your targets will know if they were transported.
    + You cannot transport someone with themselves.
    """
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
            if not action.get('can_transport', True):
                continue
            if action['target'] == target1:
                action['target'] = target2
            elif action['target'] == target2:
                action['target'] = target1

    async def tear_down(self, _actions, _player, target):
        for individual in target:
            await individual.user.send('You were transported to another location.')
