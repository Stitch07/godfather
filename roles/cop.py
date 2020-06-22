from roles.mixins import SingleAction

DESCRIPTION = 'You may interrogate one person each night for suspicious activity.'


class Cop(SingleAction):
    def __init__(self):
        super().__init__(name='Cop', role_id='cop', description=DESCRIPTION)
        self.action = 'check'
        self.action_gerund = 'checking'
        self.action_priority = 2
        self.action_text = 'check a player'

    async def run_action(self, night_record, player, target):
        pass

    async def after_action(self, player, target, night_record):
        # TODO: framer check here
        innocence = 'innocent' if target.innocent else 'suspicious'
        await player.user.send(f'Your target is {innocence}.')
