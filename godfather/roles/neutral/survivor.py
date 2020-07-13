from godfather.roles.mixins import NoTarget
from godfather.game.types import Defense, Priority
from godfather.factions import SurvivorNeutral

DESCRIPTION = 'You may vest 4 times in a game.'


class Survivor(NoTarget):
    name = 'Survivor'
    description = DESCRIPTION

    def __init__(self):
        super().__init__()
        self.faction = SurvivorNeutral()
        self.action = 'vest'
        self.action_gerund = 'vesting'
        self.action_priority = Priority.SURVIVOR
        self.action_text = 'protect yourself at night.'
        self.vests = 4
        self.vested = False

    def can_do_action(self, _game):
        if self.vests > 0:
            return True, ''
        return False, 'You are out of vests.'

    def defense(self):
        return Defense.BASIC if self.vested else Defense.NONE

    async def set_up(self, _actions, _player, _target):
        self.vested = True

    async def run_action(self, _actions, _player, _target):
        self.vests -= 1

    async def tear_down(self, _actions, _player, _target):
        self.vested = False
