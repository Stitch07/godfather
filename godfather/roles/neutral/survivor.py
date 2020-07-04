from godfather.roles.mixins import NoTarget

DESCRIPTION = 'You may vest 4 times in a game.'


class Survivor(NoTarget):
    def __init__(self):
        super().__init__(name='Survivor', role_id='survivor', description=DESCRIPTION)
        self.action = 'vest'
        self.action_gerund = 'vesting'
        self.action_priority = 0
        self.action_text = 'protect yourself at night.'
        self.vests = 4
        self.vested = False

    def can_do_action(self, _game):
        if self.vests > 0:
            return True, ''
        return False, 'You are out of vests.'

    def bulletproof(self):
        return self.vested

    async def run_action(self, _game, _night_record, _player, _target):
        self.vested = True
        self.vests -= 1

    async def after_action(self, _player, _target, _night_record):
        self.vested = False
