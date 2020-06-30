from godfather.roles.mixins import SingleAction

DESCRIPTION = 'You may watch one person at night to see who visits them.'


class Lookout(SingleAction):
    def __init__(self):
        super().__init__(name='Lookout', role_id='lookout', description=DESCRIPTION)
        self.action = 'watch'
        self.action_gerund = 'watching'
        self.action_priority = 1
        self.action_text = 'watch a player'

    async def run_action(self, game, night_record, player, target):
        pass

    async def after_action(self, player, target, night_record):
        visitors = map(lambda v: v.user.name, target.visitors)
        await player.user.send('Your target was visited by {}'.format(', '.join(visitors)))
