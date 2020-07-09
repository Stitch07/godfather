from godfather.roles.mixins import NoTarget

DESCRIPTION = 'You may alert 3 times in a game, killing everyone who visits you.'


class Veteran(NoTarget):
    def __init__(self):
        super().__init__(name='Veteran', role_id='veteran', description=DESCRIPTION)
        self.action = 'alert'
        self.action_gerund = 'alerting'
        self.action_text = 'go on alert'
        # whether the vet has alerted this night
        self.alerted = False
        self.alerts = 3
        self.can_block = False
        self.can_transport = False
        self.action_priority = 0

    def bulletproof(self):
        return self.alerted

    def can_do_action(self, _game):
        if self.alerts <= 0:
            return False, 'You ran out of alerts!'
        return True, ''

    async def run_action(self, _game, _night_record, _player, _target):
        self.alerted = True

    async def after_action(self, _player, _target, _night_record):
        self.alerted = False

    async def visited(self, player, visitor, record):
        if self.alerted:
            record[visitor.user.id]['nightkill']['result'] = True
            record[visitor.user.id]['nightkill']['by'].append(player)
            await player.user.send('You shot someone visiting you!')
            await visitor.user.send('You were killed by the veteran you visited!')
