from godfather.roles.mixins import NoTarget, Townie
from godfather.game.types import Attack, Defense, Priority

DESCRIPTION = 'You may alert 3 times in a game, killing everyone who visits you.'


class Veteran(Townie, NoTarget):
    name = 'Veteran'
    description = DESCRIPTION

    def __init__(self):
        super().__init__()
        self.action = 'alert'
        self.action_gerund = 'alerting'
        self.action_text = 'go on alert'
        # whether the vet has alerted this night
        self.alerted = False
        self.alerts = 4
        self.can_block = False
        self.can_transport = False
        self.action_priority = Priority.VETERAN

    def defense(self):
        return Defense.BASIC if self.alerted else Defense.NONE

    def can_do_action(self, _game):
        if self.alerts <= 0:
            return False, 'You ran out of alerts!'
        return True, ''

    async def set_up(self, _actions, _player, _target):
        self.alerted = True

    async def tear_down(self, _actions, _player, _target):
        self.alerted = False

    async def on_visit(self, player, visitor, actions):
        # damnit pest
        if self.alerted and visitor.role.defense() < Defense.INVINCIBLE:
            actions.record[visitor.user.id]['nightkill']['result'] = True
            actions.record[visitor.user.id]['nightkill']['type'] = Attack.POWERFUL
            actions.record[visitor.user.id]['nightkill']['by'].append(player)
            await player.user.send('You shot someone visiting you!')
            await visitor.user.send('You were killed by the veteran you visited!')
