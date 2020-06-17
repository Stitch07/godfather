from roles.mixins import SingleAction

DESCRIPTION = 'You may shoot someone every night.'


class Goon(SingleAction):
    def __init__(self):
        super().__init__(name='Goon', role_id='goon', description=DESCRIPTION)
        self.action = 'shoot'
        self.action_gerund = 'shooting'
        self.action_priority = 1  # placeholder
        self.action_text = 'shoot a player'

    def run_action(self, night_record, target):
        pl_record = night_record[target.user.id]
        pl_record.update({'nightkill': True})

    async def after_action(self, player, success, target):
        if not success:
            await player.user.send('Your target was too strong to kill!')
        await target.user.send('You were shot by a Goon. You have died!')
